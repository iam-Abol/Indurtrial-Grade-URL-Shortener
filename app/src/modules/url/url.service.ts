import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Base62Converter } from '../../common/utils/base62.converter';
import { Repository } from 'typeorm';
import { Url } from './entities/url.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  assertUrlIsSafe,
  UnsafeUrlError,
} from '../../common/utils/url-security.util';
import { User } from '../user/entities/user.entity';
import { RedisService } from '../../redis/redis.service';
import { RedisUrlData } from '../../redis/types';
import { BloomFilterService } from '../bloom-filter/bloom-filter.service';
import { AnalyticsProducerService } from 'src/queue/analytics/analytics-producer.service';
import { Request } from 'express';
import { RedirectMetadata } from './interfaces/redirect-metadata.interface';
import { TooManyRequestsException } from 'src/errors/TooManyRequestsException';

@Injectable()
export class UrlService {
  private readonly HOT_THRESHOLD = 10;
  private readonly CACHE_TTL = 3600;
  private readonly HITS_TTL = 1800;
  private readonly logger = new Logger(UrlService.name);
  constructor(
    @InjectRepository(Url)
    private readonly urlRepo: Repository<Url>,
    private redisService: RedisService,
    @Inject(forwardRef(() => BloomFilterService))
    private bloomService: BloomFilterService,
    private readonly analyticsProducer: AnalyticsProducerService,
  ) {}
  async create(url: Partial<Url>): Promise<Url> {
    const entity = this.urlRepo.create(url);
    return this.urlRepo.save(entity);
  }
  async findMyUrls(userId: number) {
    return this.urlRepo.find({
      where: {
        user: { id: userId },
      },
      order: { created_at: 'DESC' },
      select: {
        id: true,
        shortCode: true,
        longUrl: true,
        created_at: true,
        expire_at: true,
        click_count: true,
      },
    });
  }
  async findByShortCode(shortCode: string) {
    return this.urlRepo.findOne({ where: { shortCode } });
  }
  async updateShortCode(id: number, shortCode: string) {
    return this.urlRepo.update(id, { shortCode });
  }
  async incrementClickCount(id: number) {
    await this.urlRepo.increment({ id }, 'click_count', 1);
  }
  async findByCustomAlias(alias: string) {
    return this.urlRepo.findOne({ where: { customAlias: alias } });
  }
  private trackAnalytics(urlId: number, metadata: RedirectMetadata) {
    try {
      this.analyticsProducer.enqueueClick({
        urlId,
        ip: metadata.ip ?? '',
        userAgent: metadata.userAgent,
        referer: metadata.referer ?? '',
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(
        'Failed to add analytics to queue',
        error instanceof Error ? error.stack : '',
      );
    }
  }
  async redirect(shortCode: string, redirectMetadata: RedirectMetadata) {
    const key = `rate:redirect:${redirectMetadata.ip}`;
    const allowed = await this.redisService.checkRateLimit(
      key,
      3, // 30 requests
      60, // per minute
    );
    if (!allowed) {
      const retryAfter = await this.redisService.getTtl(key);
      throw new TooManyRequestsException(
        `Rate limit exceeded retry after: ${retryAfter} seconds`,
      );
    }

    if (!this.bloomService.mightContain(shortCode)) {
      console.log(`Bloom Filter: ${shortCode} definitely does not exist.`);
      throw new NotFoundException('Url not found');
    }

    let nonExistent: null | string = null;
    try {
      nonExistent = await this.redisService.get(`url:nonexistent:${shortCode}`);
    } catch (error) {
      console.error(
        'Redis negative cache read failed, falling back to DB',
        error,
      );
    }

    if (nonExistent) {
      throw new NotFoundException('Url not found');
    }
    const cacheKey = `url:${shortCode}`;
    const hitsKey = `url:${shortCode}:hits:30m`;

    let cachedData: string | null = null;

    try {
      cachedData = await this.redisService.get(cacheKey);
    } catch (error) {
      console.error('Redis is down, falling back to DB', error);
    }

    if (cachedData) {
      console.log('redis hit');
      this.trackHit(hitsKey).catch(() => {});
      const parsed = JSON.parse(cachedData) as RedisUrlData;

      if (parsed.expireAt && new Date(parsed.expireAt) < new Date()) {
        try {
          await this.redisService.del(cacheKey);
        } catch (error) {
          console.error('Failed to delete expired cache key', error);
        }
        throw new NotFoundException('Url expired');
      }
      this.trackAnalytics(parsed.id, redirectMetadata);

      return parsed.longUrl;
    }

    const url = await this.findByShortCode(shortCode);
    if (!url) {
      try {
        await this.redisService.setEx(
          `url:nonexistent:${shortCode}`,
          300,
          'NOT_FOUND',
        );
      } catch (error) {
        console.error('Failed to save negative cache', error);
      }
      throw new NotFoundException('Url not found');
    }

    if (url.expire_at && url.expire_at < new Date()) {
      throw new NotFoundException('Url  expired');
    }

    const currentHits = await this.trackHit(hitsKey);
    if (currentHits >= this.HOT_THRESHOLD) {
      const ttl = this.computeCacheTtl(url.expire_at);
      if (ttl) {
        try {
          await this.redisService.setEx(
            cacheKey,
            ttl,
            JSON.stringify({
              id: url.id,

              longUrl: url.longUrl,
              expireAt: url.expire_at,
            }),
          );
        } catch (err) {
          console.error('Failed to save to Redis', err);
        }
      }
    }
    // TODO -> click rate with a queue
    this.trackAnalytics(url.id, redirectMetadata);
    return url.longUrl;
  }
  async shorten(
    longUrl: string,
    userId: number,
  ): Promise<{ shortUrl: string; id: number }> {
    try {
      await assertUrlIsSafe(longUrl);
    } catch (err) {
      if (err instanceof UnsafeUrlError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
    try {
      const createdUrl = await this.create({
        longUrl,
        user: { id: userId } as User,
      });
      const shortCode = Base62Converter.encode(createdUrl.id);
      await this.updateShortCode(createdUrl.id, shortCode);
      const domain = process.env.SHORTENER_DOMAIN || 'http://localhost:3000';
      this.bloomService.add(shortCode);
      return {
        shortUrl: `${domain}/${shortCode}`,
        id: createdUrl.id,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to shorten URL');
    }
  }
  private async trackHit(key: string): Promise<number> {
    return await this.redisService.incrAndExpire(key, this.HITS_TTL);
  }
  async delete(id: number, userId: number) {
    const url = await this.urlRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!url) {
      throw new NotFoundException(
        'URL not found or you do not have permission',
      );
    }

    try {
      await this.urlRepo.softDelete(id);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete');
    }
    const { shortCode } = url;
    const cacheKey = `url:${shortCode}`;
    const hitsKey = `url:${shortCode}:hits:30m`;
    try {
      await this.redisService.del(cacheKey);
      await this.redisService.del(hitsKey);
    } catch (error) {
      console.log('failed to delete from redis');
    }
  }
  computeCacheTtl(expire_at: Date | null) {
    const baseTtl = this.CACHE_TTL;
    if (expire_at) {
      const secondsUntilExpire = Math.floor(
        (expire_at.getTime() - Date.now()) / 1000,
      );
      if (secondsUntilExpire <= 0) {
        return null;
      }
      let ttl = Math.min(baseTtl, secondsUntilExpire);
      if (ttl < 5) {
        return null;
      }
      const jitter = Math.floor(ttl * Math.random() * 0.1);
      ttl = ttl - jitter;

      return Math.max(ttl, 1);
    }
    let ttl = baseTtl;

    if (ttl < 5) {
      return null;
    }

    const jitter = Math.floor(ttl * Math.random() * 0.1);
    ttl = ttl - jitter;

    return Math.max(ttl, 1);
  }
  getShortCodes() {
    return this.urlRepo.find({ select: ['shortCode'] });
  }
}
