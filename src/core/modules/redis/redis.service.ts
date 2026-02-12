import type { Cache as CacheManager } from 'cache-manager';
import type { RedisClientType } from 'redis';
import type { Client, ConnectorPackage } from './types';
import { Inject, Injectable } from '@nestjs/common';
import Ioredis from 'ioredis';
import { ClientTagToken, RedisClientToken } from './redis.constants';

@Injectable()
export class RedisService<T extends ConnectorPackage> {
  @Inject(RedisClientToken)
  private client: Client<T>;

  async get<T>(key: string, format?: boolean): Promise<T | null> {
    let res;
    if (this.client instanceof Ioredis) {
      res = await this.client.get(key);
    }

    if (this.client[ClientTagToken] === 'redis') {
      res = await (this.client as RedisClientType).get(key);
    }

    if (this.client[ClientTagToken] === 'cache-manager') {
      res = await (this.client as CacheManager).get(key);
    }

    if (format) {
      try {
        return JSON.parse(res as string);
      }
      catch {
        return res;
      }
    }

    return res;
  }

  async set(key: string, value: string | number, ttl?: number) {
    if (this.client instanceof Ioredis) {
      // TODO: Ioredis 不能存对象？
      const res = await this.client.set(key, value);
      if (ttl) {
        await this.client.expire(key, ttl);
      }
      return res === 'OK';
    }

    if (this.client[ClientTagToken] === 'redis') {
      const options = ttl ? { EX: ttl } : {};
      const res = await (this.client as RedisClientType).set(key, value, options);
      return res === 'OK';
    }

    if (this.client[ClientTagToken] === 'cache-manager') {
      const res = await (this.client as CacheManager).set(key, value, ttl);
      return res === value;
    }

    return Promise.resolve(false);
  }

  async del(key: string) {
    if (this.client instanceof Ioredis) {
      const res = await this.client.del(key);
      return res === 1;
    }

    if (this.client[ClientTagToken] === 'redis') {
      const res = await (this.client as RedisClientType).del(key);
      return res === 1;
    }

    if (this.client[ClientTagToken] === 'cache-manager') {
      const res = await (this.client as CacheManager).del(key);
      return res;
    }

    return Promise.resolve(false);
  }

  getClient() {
    return this.client;
  }
}
