import { RedisOptions as IoredisClientOptions } from 'ioredis';
import { RedisClientOptions } from 'redis';
import { createIoredisClientFactory } from './ioredis';
import { createRedisClientFactory } from './redis';
import { ClientOptions, ConnectorPackage, defaultFactoryOptions, FactoryOptions } from './utils';

export function createClientFactory<T extends ConnectorPackage>(
  connectorPackage: T,
  factoryOptions: FactoryOptions,
  redisOptions: ClientOptions<T>,
) {
  if (connectorPackage === 'ioredis') {
    return createIoredisClientFactory(Object.assign({}, defaultFactoryOptions, factoryOptions), redisOptions as IoredisClientOptions);
  }
  return createRedisClientFactory(Object.assign({}, defaultFactoryOptions, factoryOptions), redisOptions as RedisClientOptions);
}
