import type { RedisOptions as IoredisClientOptions } from 'ioredis';
import type { ReconnectOptions } from '../types';
import Ioredis from 'ioredis';
import { wait } from './utils';

function connect(client: Ioredis) {
  if (client.status === 'connect') {
    return Promise.resolve();
  }
  if (['connecting', 'reconnecting'].includes(client.status)) {
    return new Promise<void>((resolve, reject) => {
      client.on('connect', () => {
        resolve();
      });
      client.on('error', (err) => {
        if (client.status !== 'connect') {
          reject(err);
        }
      });
    });
  }
}

function reconnect(
  client: Ioredis,
  reconnectOptions: ReconnectOptions,
  connectCount: number = 0,
) {
  return connect(client)?.catch((err) => {
    if (connectCount >= (reconnectOptions.reconnectCount as number)) {
      if (typeof reconnectOptions.onConnectError === 'function') {
        reconnectOptions.onConnectError(err);
      }
      else {
        throw err;
      }
    }
    connectCount++;
    return wait(reconnectOptions.reconnectInterval as number).then(() => reconnect(client, reconnectOptions, connectCount));
  });
}

/**
 * @description 创建 Ioredis 客户端
 */
export async function createIoredisClient(
  reconnectOptions: ReconnectOptions,
  redisOptions: IoredisClientOptions,
) {
  const client = new Ioredis(redisOptions);

  await reconnect(client, reconnectOptions, 0);

  return client;
}
