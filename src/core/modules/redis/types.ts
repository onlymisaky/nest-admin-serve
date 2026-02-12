import type { CacheModuleOptions } from '@nestjs/cache-manager';
import type { ModuleMetadata } from '@nestjs/common';
import type { Cache as CacheManager } from 'cache-manager';
import type Ioredis from 'ioredis';
import type { RedisOptions as IoredisClientOptions } from 'ioredis';
import type { RedisClientOptions, RedisClientType } from 'redis';

// 连接器包
export type ConnectorPackage = 'redis' | 'ioredis' | 'cache-manager';

export interface ClientMap {
  'redis': RedisClientType
  'ioredis': Ioredis
  'cache-manager': CacheManager
}

export interface ClientOptionsMap {
  'redis': RedisClientOptions
  'ioredis': IoredisClientOptions
  'cache-manager': CacheModuleOptions
}

export type Client<K extends ConnectorPackage> = ClientMap[K];

// 客户端配置
export type ClientOptions<K extends ConnectorPackage> = ClientOptionsMap[K];

// 工厂函数配置
export interface ReconnectOptions {
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

export interface RedisModuleSyncOptions<K extends ConnectorPackage> {
  redisOptions: ClientOptions<K>
}

export interface RedisModuleAsyncOptions<K extends ConnectorPackage, T extends Array<any> = any> {
  inject?: T
  useFactory: (...args: T) => Promise<ClientOptions<K>> | ClientOptions<K>
}

export type RedisModuleOptions<K extends ConnectorPackage, T extends Array<any> = any> = {
  isGlobal?: boolean
  connectorPackage: K
} & Pick<ModuleMetadata, 'imports'> & (RedisModuleSyncOptions<K> | RedisModuleAsyncOptions<K, T>);
