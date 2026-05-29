import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { UrlModule } from './modules/url/url.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { BloomFilterModule } from './modules/bloom-filter/bloom-filter.module';

@Module({
  imports: [
    UserModule,
    UrlModule,
    AnalyticsModule,
    DatabaseModule,
    QueueModule,
    RedisModule,
    AuthModule,
    BloomFilterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
