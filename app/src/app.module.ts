import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { UrlModule } from './modules/url/url.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    UserModule,
    UrlModule,
    AnalyticsModule,
    DatabaseModule,
    QueueModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
