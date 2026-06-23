import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from '../entities/url.entity';
import { IsNull, LessThanOrEqual, Repository } from 'typeorm';
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

    let affected = 0;
    try {
      while (true) {
        const urls = await this.urlRepository.find({
          where: {
            expireAt: LessThanOrEqual(now),
            deletedAt: IsNull(),
          },
          order: { id: 'ASC' },
          take: 1000,
          select: ['id'],
        });
        if (urls.length === 0) break;
        await this.urlRepository
          .createQueryBuilder()
          .update(Url)
          .set({ deletedAt: () => 'NOW()' })
          .whereInIds(urls.map((u) => u.id))
          .execute();
        affected += urls.length;
      }
    } finally {
      this.logger.log(`Total expired URLs deleted: ${affected}`);
      await this.redisService.del(this.LOCK_KEY);
    }
  }
}
