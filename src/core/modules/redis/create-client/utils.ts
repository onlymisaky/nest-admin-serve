import { RedisOptions as IoredisClientOptions } from 'ioredis';
import { RedisClientOptions } from 'redis';

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
  /**
   * 主动重连次数
   * ioredis 和 redis 在连接失败后，会自动重连，不会计入主动重连次数
   * 只有主动调用 client.connect() 方法时，才会计入主动重连次数
   */
  reconnectCount?: number
  /**
   * 主动重连间隔
   */
  reconnectInterval?: number
  /**
   * 主动重连次数用完，连接错误回调
   */
  onConnectError?: (err: Error) => void
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 工厂函数默认配置
export const defaultFactoryOptions: FactoryOptions = {
  reconnectCount: 3,
  reconnectInterval: 1000,
  onConnectError: (err) => {
    throw err;
  },
};
