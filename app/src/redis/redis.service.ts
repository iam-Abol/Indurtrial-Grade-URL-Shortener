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
  async increment(key: string, step = 1): Promise<number> {
    if (step === 1) return this.client.incr(key);
    return this.client.incrBy(key, step);
  }
}
