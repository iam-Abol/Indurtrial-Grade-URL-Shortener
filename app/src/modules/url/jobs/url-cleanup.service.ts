import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from '../entities/url.entity';
import { LessThan, Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UrlCleanupService {
  private readonly logger = new Logger(UrlCleanupService.name);
  private readonly LOCK_KEY = 'cron:cleanup:urls';
  private readonly LOCK_TTL = 60 * 10;
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    private readonly redisService: RedisService,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async cleanupExpiredUrls() {
    const now = new Date();

    const isLocked = await this.redisService.get(this.LOCK_KEY);

    if (isLocked) {
      this.logger.log('Cleanup already running, skipping...');
      return;
    }

    await this.redisService.setEx(this.LOCK_KEY, this.LOCK_TTL, '1');
    try {
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
    } finally {
      await this.redisService.del(this.LOCK_KEY);
    }
  }
}
