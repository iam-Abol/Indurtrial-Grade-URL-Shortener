import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ANALYTICS_QUEUE } from './analytics-producer.service';
import { ClickAnalyticsEvent } from '../events/ClickAnalyticsEvent';
import { Logger } from '@nestjs/common';
import { AnalyticsService } from 'src/modules/analytics/analytics.service';

@Processor(ANALYTICS_QUEUE)
export class AnalyticsConsumer extends WorkerHost {
  private readonly logger = new Logger(AnalyticsConsumer.name);
  constructor(private readonly analyticsService: AnalyticsService) {
    super();
  }
  async process(job: Job<ClickAnalyticsEvent>): Promise<any> {
    this.logger.log(job.name, job.data);
    await this.analyticsService.createClick(job.data);
  }
}
