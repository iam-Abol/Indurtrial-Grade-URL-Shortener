import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from '../entities/url.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class UrlCleanupService {
  private readonly logger = new Logger(UrlCleanupService.name);
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}
  @Cron(CronExpression.EVERY_12_HOURS)
  async cleanupExpiredUrls() {
    const now = new Date();

    const result = await this.urlRepository
      .createQueryBuilder()
      .update(Url)
      .set({
        deletedAt: () => 'NOW()',
      })
      .where('expireAt IS NOT NULL')
      .andWhere('expireAt <= :now', { now })
      .andWhere('deletedAt IS NULL')
      .execute();

    this.logger.log(`Expired URLs soft-deleted: ${result.affected || 0}`);
  }
}
