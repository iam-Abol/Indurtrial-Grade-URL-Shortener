import { Inject, Injectable, Logger } from '@nestjs/common';
import type { RedisClientType } from 'redis';
import { TooManyRequestsException } from 'src/errors/TooManyRequestsException';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly client: RedisClientType,
  ) {}

  async getTtl(key: string): Promise<number> {
    return this.client.ttl(key);
  }
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

  async enforceRateLimit(
    key: string,
    limit: number,
    ttl: number,
    options?: { failOpen?: boolean },
  ) {
    let allowed: boolean;
    try {
      allowed = await this.checkRateLimit(key, limit, ttl);
    } catch (err) {
      this.logger.error('Redis rate limit failed', err);

      if (options?.failOpen) return;

      throw new TooManyRequestsException('Rate limiter unavailable');
    }

    if (!allowed) {
      const retryAfter = Math.max(0, await this.getTtl(key));
      throw new TooManyRequestsException(
        `Rate limit exceeded retry after: ${retryAfter}s`,
      );
    }
  }
}
