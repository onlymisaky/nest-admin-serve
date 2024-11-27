import Ioredis, { RedisOptions } from 'ioredis';
import * as redis from 'redis';
import { RedisClientOptions } from 'redis';

const MAX_RECONNECT_COUNT = 3;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createRedisClientFactory(config: RedisClientOptions) {
  let reConnectCount = 0;
  const client = redis.createClient(config);
  await client.connect().catch((err) => {
    if (reConnectCount > MAX_RECONNECT_COUNT) {
      throw err;
    }
    reConnectCount++;
    return wait(1000).then(() => client.connect());
  });
  return client;
}

export async function createIoredisClientFactory(config: RedisOptions) {
  const redisClient = new Ioredis(config);
  let reConnectCount = 0;
  await redisClient.connect().catch((err) => {
    if (reConnectCount > MAX_RECONNECT_COUNT) {
      throw err;
    }
    reConnectCount++;
    return wait(1000).then(() => redisClient.connect());
  });
  return redisClient;
}
