import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Base62Converter } from 'src/common/utils/base62.converter';
import { Repository } from 'typeorm';
import { Url } from './entities/url.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  assertUrlIsSafe,
  UnsafeUrlError,
} from 'src/common/utils/url-security.util';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepo: Repository<Url>,
  ) {}
  async create(url: Partial<Url>): Promise<Url> {
    const entity = this.urlRepo.create(url);
    return this.urlRepo.save(entity);
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
    const url = await this.findByShortCode(shortCode);
    if (!url) throw new NotFoundException('Url not found');
    if (url.expire_at && url.expire_at < new Date()) {
      throw new NotFoundException('Url  expired');
    }
    // TODO -> click rate with a queue
    return url;
  }
  async shorten(longUrl: string): Promise<{ shortUrl: string }> {
    try {
      await assertUrlIsSafe(longUrl);
    } catch (err) {
      if (err instanceof UnsafeUrlError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
    try {
      const createdUrl = await this.create({ longUrl });
      const shortCode = Base62Converter.encode(createdUrl.id);
      await this.updateShortCode(createdUrl.id, shortCode);
      const domain = process.env.SHORTENER_DOMAIN || 'http://localhost:3000';

      return {
        shortUrl: `${domain}/${shortCode}`,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to shorten URL');
    }
  }
}
