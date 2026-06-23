import { MiddlewareConsumer, Module } from '@nestjs/common';
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
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggerModule } from 'nestjs-pino';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

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
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    ScheduleModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req) => {
          return {
            requestId: req['requestId'],
          };
        },
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                },
              }
            : undefined,
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie'],
          remove: true,
        },

        autoLogging: true,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
