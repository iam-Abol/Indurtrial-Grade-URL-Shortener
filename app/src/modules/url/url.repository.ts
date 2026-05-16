import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UrlRepository {
  constructor(
    @InjectRepository(Url)
    private readonly repo: Repository<Url>,
  ) {}
  async create(url: Partial<Url>): Promise<Url> {
    const entity = this.repo.create(url);
    return this.repo.save(entity);
  }
  async findByShortCode(shortCode: string) {
    return this.repo.findOne({ where: { shortCode } });
  }
  async updateShortCode(id: number, shortCode: string) {
    return this.repo.update(id, { shortCode });
  }
  async incrementClickCount(id: number) {
    await this.repo.increment({ id }, 'click_count', 1);
  }
  async findByCustomAlias(alias: string) {
    return this.repo.findOne({ where: { customAlias: alias } });
  }
}
