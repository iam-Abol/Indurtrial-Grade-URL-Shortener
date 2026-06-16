import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClickAnalytics } from './entities/analytics.entity';
import { Repository } from 'typeorm';
import { ClickAnalyticsEvent } from 'src/queue/events/ClickAnalyticsEvent';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ClickAnalytics)
    private repo: Repository<ClickAnalytics>,
  ) {}
  async createClick(event: ClickAnalyticsEvent) {
    const click = this.repo.create({
      url: { id: event.urlId },
      ip_hash: event.ip,

      timestamp: event.timestamp,

      user_agent: event.userAgent,

      referer_domain: event.referer,

      browser: '',

      os: '',

      device_type: '',

      country: '',

      is_bot: false,
    });

    await this.repo.save(click);
  }
}
