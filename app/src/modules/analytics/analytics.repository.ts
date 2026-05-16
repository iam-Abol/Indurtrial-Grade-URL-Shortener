import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClickAnalytics } from './entities/analytics.entity';

@Injectable()
export class AnalyticsRepository {
  constructor(
    @InjectRepository(ClickAnalytics)
    private readonly repo: Repository<ClickAnalytics>,
  ) {}
}
