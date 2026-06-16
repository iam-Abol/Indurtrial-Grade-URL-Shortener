import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ANALYTICS_QUEUE } from './analytics-producer.service';
import { ClickAnalyticsEvent } from '../events/ClickAnalyticsEvent';
import { Logger } from '@nestjs/common';

@Processor(ANALYTICS_QUEUE)
export class AnalyticsConsumer extends WorkerHost {
  private readonly logger = new Logger(AnalyticsConsumer.name);

  async process(job: Job<ClickAnalyticsEvent>): Promise<any> {
    this.logger.log(job.data);
  }
}
