import { Injectable } from '@nestjs/common';
import { Base62Converter } from 'src/common/utils/base62.converter';
import { Repository } from 'typeorm';
import { Url } from './entities/url.entity';
import { InjectRepository } from '@nestjs/typeorm';

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
  async shorten(longUrl: string) {
    try {
      const data = await this.create({ longUrl });
      console.log(data);
      const shortCode = Base62Converter.encode(data.id);
      await this.updateShortCode(data.id, shortCode);
      return `www.cochik.ir/${shortCode}`;
    } catch (error) {
      console.log(error);
      throw new Error('An Error accured');
    }
  }
}
