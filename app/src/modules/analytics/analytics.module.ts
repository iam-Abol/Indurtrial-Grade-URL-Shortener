import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ClickAnalytics } from './entities/analytics.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ClickAnalytics])],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
