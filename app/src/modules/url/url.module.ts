import { forwardRef, Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { RedisModule } from 'src/redis/redis.module';
import { BloomFilterModule } from '../bloom-filter/bloom-filter.module';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Url]),
    RedisModule,
    forwardRef(() => BloomFilterModule),
    QueueModule,
  ],
  controllers: [UrlController],
  providers: [UrlService],
  exports: [UrlService],
})
export class UrlModule {}
