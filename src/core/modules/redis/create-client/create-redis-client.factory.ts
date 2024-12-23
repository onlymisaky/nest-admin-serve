import Ioredis, { RedisOptions as IoredisClientOptions } from 'ioredis';
import * as redis from 'redis';
import { RedisClientOptions, RedisClientType } from 'redis';

// 连接器包
export type ConnectorPackage = 'redis' | 'ioredis';

// 客户端配置
export type ClientOptions<K extends ConnectorPackage> = K extends 'redis'
  ? RedisClientOptions
  : K extends 'ioredis'
    ? IoredisClientOptions
    : never;

// 工厂函数配置
export interface FactoryOptions {
  reconnectCount?: number
  reconnectInterval?: number
  onConnectError?: (err: Error) => void
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 连接客户端
function connect(
  client: RedisClientType | Ioredis,
  factoryOptions: FactoryOptions,
  connectCount: number = 0,
) {
  return client.connect().catch((err) => {
    if (connectCount > factoryOptions.reconnectCount) {
      if (typeof factoryOptions.onConnectError === 'function') {
        factoryOptions.onConnectError(err);
      }
      else {
        throw err;
      }
    }
    connectCount++;
    return wait(factoryOptions.reconnectInterval).then(() => connect(client, factoryOptions, connectCount));
  });
}

/**
 * @description 创建 Redis 客户端
 */
async function createRedisClientFactory(
  factoryOptions: FactoryOptions,
  redisOptions: RedisClientOptions,
) {
  const client = redis.createClient(redisOptions);

  // 主动捕获 error 会导致 client.connect().catch() 无法捕获到错误
  // client.on('error', (err) => { console.error('Redis error', err); });

  await connect(client as RedisClientType, factoryOptions, 0);
  return client;
}

/**
 * @description 创建 Ioredis 客户端
 */
async function createIoredisClientFactory(
  factoryOptions: FactoryOptions,
  redisOptions: IoredisClientOptions,
) {
  const client = new Ioredis(redisOptions);

  // eslint-disable-next-line style/max-statements-per-line
  client.on('error', (err) => { console.error('Ioredis error', err); });

  await connect(client, factoryOptions, 0);
  return client;
}

// 工厂函数默认配置
const defaultFactoryOptions: FactoryOptions = {
  reconnectCount: 3,
  reconnectInterval: 1000,
  onConnectError: (err) => {
    throw err;
  },
};

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
