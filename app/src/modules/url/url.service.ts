import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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

@Injectable()
export class UrlService {
  private readonly HOT_THRESHOLD = 10;
  private readonly CACHE_TTL = 3600;
  private readonly HITS_TTL = 1800;
  constructor(
    @InjectRepository(Url)
    private readonly urlRepo: Repository<Url>,
    private redisService: RedisService,
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
  async redirect(shortCode: string) {
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
        await this.redisService.del(cacheKey);
        throw new NotFoundException('Url expired');
      }
      this.trackHit(hitsKey).catch(() => {});

      return parsed.longUrl;
    }
    const url = await this.findByShortCode(shortCode);
    if (!url) throw new NotFoundException('Url not found');

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
}
