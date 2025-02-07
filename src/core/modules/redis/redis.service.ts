import { Inject, Injectable } from '@nestjs/common';
import Ioredis from 'ioredis';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService<T extends 'ioredis' | 'redis'> {
  @Inject(REDIS_CLIENT)
  private redisClient: T extends 'ioredis' ? Ioredis : T extends 'redis' ? RedisClientType : never;

  async get(key: string) {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string | number, ttl?: number) {
    if (this.redisClient instanceof Ioredis) {
      return await this.redisClient
        .set(key, value)
        .then(() => this.redisClient.expire(key, ttl as number).then(() => 'OK'));
    }
    const options = ttl ? { EX: ttl } : {};
    return await this.redisClient.set(key, value, options);
  }

  async del(key: string) {
    return await this.redisClient.del(key);
  }

  getClient() {
    return this.redisClient;
  }
}
