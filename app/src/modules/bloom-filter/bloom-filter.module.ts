import { Module } from '@nestjs/common';
import { BloomFilterService } from './bloom-filter.service';
import { UrlModule } from '../url/url.module';

@Module({
  providers: [BloomFilterService],
  imports: [UrlModule],
})
export class BloomFilterModule {}
