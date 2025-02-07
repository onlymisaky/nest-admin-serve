import * as redis from 'redis';
import { RedisClientOptions, RedisClientType } from 'redis';
import { FactoryOptions, wait } from './utils';

// 连接客户端
function connect(
  client: RedisClientType,
  factoryOptions: FactoryOptions,
  connectCount: number = 0,
): Promise<RedisClientType> {
  return client.connect().catch((err) => {
    if (connectCount >= (factoryOptions.reconnectCount as number)) {
      if (typeof factoryOptions.onConnectError === 'function') {
        factoryOptions.onConnectError(err);
      }
      else {
        throw err;
      }
    }
    connectCount++;
    return wait(factoryOptions.reconnectInterval as number).then(() => connect(client, factoryOptions, connectCount));
  });
}

/**
 * @description 创建 Redis 客户端
 */
export async function createRedisClientFactory(
  factoryOptions: FactoryOptions,
  redisOptions: RedisClientOptions,
) {
  const client = redis.createClient(redisOptions);

  // 主动捕获 error 会导致 client.connect().catch() 无法捕获到错误
  // client.on('error', (err) => { });

  await connect(client as RedisClientType, factoryOptions, 0);
  return client;
}
