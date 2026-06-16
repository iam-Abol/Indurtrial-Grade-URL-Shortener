import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AnalyticsProducerService } from './analytics/analytics-producer.service';
import { AnalyticsConsumer } from './analytics/analytics-consumer.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analytics',
    }),
  ],
  providers: [AnalyticsProducerService, AnalyticsConsumer],
  exports: [AnalyticsProducerService],
})
export class QueueModule {}
