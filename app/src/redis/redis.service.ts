import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly client: RedisClientType,
  ) {}

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }
  async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.client.setEx(key, ttlSeconds, value);
  }
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incrAndExpire(key: string, seconds: number) {
    const newValue = await this.client.incr(key);
    await this.client.expire(key, seconds, 'NX');

    return newValue;
  }

  async checkRateLimit(
    key: string,
    limit: number,
    ttlSeconds: number,
  ): Promise<boolean> {
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.expire(key, ttlSeconds);
    }
    return count <= limit;
  }
}
