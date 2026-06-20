import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}
  @Get('url/:urlId/clicks')
  getClicks(@Param('urlId') urlId: number, @Query('days') days = 7) {
    return this.analyticsService.getClicksLastDays(Number(urlId), Number(days));
  }
}
