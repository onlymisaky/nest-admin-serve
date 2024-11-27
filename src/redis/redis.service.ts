import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
  @Inject(REDIS_CLIENT)
  private redisClient: RedisClientType;

  async get(key: string) {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string | number, ttl?: number) {
    const options = ttl ? { EX: ttl } : {};
    return await this.redisClient.set(key, value, options);
  }

  async del(key: string) {
    return await this.redisClient.del(key);
  }
}
