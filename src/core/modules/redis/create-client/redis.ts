import type { RedisClientOptions, RedisClientType } from 'redis';
import type { ReconnectOptions } from '../types';
import * as redis from 'redis';
import { wait } from './utils';

function connect(
  client: RedisClientType,
  reconnectOptions: ReconnectOptions,
  connectCount: number = 0,
): Promise<RedisClientType> {
  return client.connect().catch((err) => {
    if (connectCount >= (reconnectOptions.reconnectCount as number)) {
      if (typeof reconnectOptions.onConnectError === 'function') {
        reconnectOptions.onConnectError(err);
      }
      else {
        throw err;
      }
    }
    connectCount++;
    return wait(reconnectOptions.reconnectInterval as number).then(() => connect(client, reconnectOptions, connectCount));
  });
}

export async function createRedisClient(
  reconnectOptions: ReconnectOptions,
  redisOptions: RedisClientOptions,
) {
  const client = redis.createClient(redisOptions);

  // 主动捕获 error 会导致 client.connect().catch() 无法捕获到错误
  // client.on('error', (err) => { });

  await connect(client as RedisClientType, reconnectOptions, 0);
  return client;
}
