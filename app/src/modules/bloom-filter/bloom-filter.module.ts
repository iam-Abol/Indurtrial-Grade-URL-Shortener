import { Module } from '@nestjs/common';
import { BloomFilterService } from './bloom-filter.service';

@Module({
  providers: [BloomFilterService]
})
export class BloomFilterModule {}
