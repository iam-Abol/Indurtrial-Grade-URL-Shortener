import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AnalyticsProducerService } from './analytics/analytics-producer.service';
import { AnalyticsConsumer } from './analytics/analytics-consumer.service';
import { AnalyticsModule } from 'src/modules/analytics/analytics.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analytics',
    }),
    AnalyticsModule,
  ],
  providers: [AnalyticsProducerService, AnalyticsConsumer],
  exports: [AnalyticsProducerService],
})
export class QueueModule {}
