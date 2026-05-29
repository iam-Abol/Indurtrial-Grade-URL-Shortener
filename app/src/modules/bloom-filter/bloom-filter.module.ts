import { forwardRef, Module } from '@nestjs/common';
import { BloomFilterService } from './bloom-filter.service';
import { UrlModule } from '../url/url.module';

@Module({
  providers: [BloomFilterService],
  imports: [forwardRef(() => UrlModule)],
  exports: [BloomFilterService],
})
export class BloomFilterModule {}
