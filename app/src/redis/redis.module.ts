import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          url: process.env.REDIS_URL || 'redis://redis:6379',
          socket: {
            reconnectStrategy: (retries) => {
              return Math.min(retries * 50, 2000);
            },
          },
        });

        client.on('error', (err) => {
          // console.error('Redis Client Error', err);
        });

        await client.connect();

        return client;
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
