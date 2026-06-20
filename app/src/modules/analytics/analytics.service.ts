import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClickAnalytics } from './entities/analytics.entity';
import { Repository } from 'typeorm';
import { ClickAnalyticsEvent } from 'src/queue/events/ClickAnalyticsEvent';
import {
  detectBrowser,
  detectDevice,
  detectOS,
  extractDomain,
  hashIp,
} from './helpers/util';
import { Url } from '../url/entities/url.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ClickAnalytics)
    private repo: Repository<ClickAnalytics>,
  ) {}
  async createClick(event: ClickAnalyticsEvent) {
    const ua = event.userAgent || '';
    const referer = event.referer || '';

    const browser = detectBrowser(ua);
    const os = detectOS(ua);
    const device_type = detectDevice(ua);
    const referer_domain = extractDomain(referer);
    const is_bot = /bot|crawler|spider/i.test(ua);

    const click = new ClickAnalytics();

    click.url = { id: event.urlId } as Url;
    click.ip_hash = hashIp(event.ip);
    click.user_agent = event.userAgent;
    click.browser = browser;
    click.os = os;
    click.device_type = device_type;
    click.country = '';
    click.is_bot = is_bot;
    click.referer_domain = referer_domain || '';

    await this.repo.save(click);
  }

  async getClicksLastDays(urlId: number, days: number) {
    const since = new Date();

    since.setDate(since.getDate() - days);

    return this.repo
      .createQueryBuilder('click')
      .where('click.url_id = :urlId', {
        urlId,
      })
      .andWhere('click.timestamp >= :since', { since })
      .getCount();
  }
}
