import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ClickAnalytics } from './entities/analytics.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClickAnalytics])],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
