import Ioredis, { RedisOptions as IoredisClientOptions } from 'ioredis';
import { FactoryOptions, wait } from './utils';

// 连接客户端
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
  factoryOptions: FactoryOptions,
  connectCount: number = 0,
) {
  return connect(client).catch((err) => {
    if (connectCount >= 888888888) {
      if (typeof factoryOptions.onConnectError === 'function') {
        factoryOptions.onConnectError(err);
      }
      else {
        throw err;
      }
    }
    connectCount++;
    return wait(factoryOptions.reconnectInterval).then(() => reconnect(client, factoryOptions, connectCount));
  });
}

/**
 * @description 创建 Ioredis 客户端
 */
export async function createIoredisClientFactory(
  factoryOptions: FactoryOptions,
  redisOptions: IoredisClientOptions,
) {
  const client = new Ioredis(redisOptions);

  await reconnect(client, factoryOptions, 0);

  return client;
}
