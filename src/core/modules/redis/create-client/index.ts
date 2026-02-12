import type { Cache as CacheManager } from 'cache-manager';
import type { RedisOptions as IoredisClientOptions } from 'ioredis';
import type { RedisClientOptions } from 'redis';
import type { ClientOptions, ConnectorPackage } from '../types';
import Ioredis from 'ioredis';
import * as redis from 'redis';
import { ClientTagToken } from '../redis.constants';

export async function createClient<T extends ConnectorPackage>(
  connectorPackage: T,
  redisOptions: ClientOptions<T>,
  cacheManager: CacheManager,
) {
  // TODO: 在分别封装 ioredis 和 redis 时，突然意识到再处理一遍错误重连好像有些多余，所以先不封装的那么复杂了

  try {
    if (connectorPackage === 'ioredis') {
      const client = new Ioredis(redisOptions as IoredisClientOptions);
      if ((redisOptions as IoredisClientOptions).lazyConnect) {
        await client.connect();
      }
      client[ClientTagToken] = connectorPackage;
      return client;
    }

    if (connectorPackage === 'redis') {
      const client = redis.createClient(redisOptions as RedisClientOptions);
      await client.connect();
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      client[ClientTagToken] = connectorPackage;
      return client;
    }

    throw new Error('不支持的 redis 连接包，目前只支持 ioredis 和 redis');
  }
  catch (error) {
    console.error('redis 连接失败');
    console.error(error);
    console.warn('使用 cache-manager 代替');
    return cacheManager;
  }
}
