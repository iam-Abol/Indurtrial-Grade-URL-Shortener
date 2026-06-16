import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { ClickAnalyticsEvent } from '../events/ClickAnalyticsEvent';

////
export const ANALYTICS_QUEUE = 'analytics';
////
@Injectable()
export class AnalyticsProducerService {
  constructor(@InjectQueue(ANALYTICS_QUEUE) private analyticsQueue: Queue) {}

  async enqueueClick(event: ClickAnalyticsEvent) {
    await this.analyticsQueue.add('click', event, {
      attempts: 3,
      removeOnComplete: 1000,
      removeOnFail: 5000,
    });
  }
}
