import type { DynamicModule, FactoryProvider, OnModuleDestroy, Provider } from '@nestjs/common';
import type { Cache as CacheManager } from 'cache-manager';
import type Ioredis from 'ioredis';
import type { RedisClientType } from 'redis';
import type { ConnectorPackage, RedisModuleAsyncOptions, RedisModuleOptions, RedisModuleSyncOptions } from './types';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Inject, Module } from '@nestjs/common';
import { createClient } from './create-client';
import { ClientTagToken, RedisClientToken } from './redis.constants';
import { RedisService } from './redis.service';

function createRedisModule(isGlobal?: boolean) {
  const moduleMetadata: DynamicModule = {
    global: !!isGlobal,
    module: RedisModule,
    providers: [
      RedisService,
      {
        provide: RedisClientToken,
        useFactory: () => { return null; },
      },
    ],
    exports: [RedisService, RedisClientToken],
  };

  return moduleMetadata;
}

function findRedisClientProvider(providers: Provider[]) {
  return providers.find((provider: FactoryProvider) => provider.provide && provider.provide === RedisClientToken) as FactoryProvider;
}

@Module({})
export class RedisModule implements OnModuleDestroy {
  static register<K extends ConnectorPackage>(options: RedisModuleOptions<K>): DynamicModule {
    const {
      isGlobal,
      connectorPackage,
      imports,
      ...moduleOptions
    } = options;

    const moduleMetadata = createRedisModule(isGlobal);

    moduleMetadata.imports = Array.isArray(imports) ? imports : [];
    moduleMetadata.imports.push(CacheModule.register({ isGlobal: true }));

    const provider = findRedisClientProvider(moduleMetadata.providers || []);

    provider.inject = [CACHE_MANAGER];

    if (connectorPackage !== 'ioredis' && connectorPackage !== 'redis') {
      provider.useFactory = (cacheManager: CacheManager) => {
        cacheManager[ClientTagToken] = connectorPackage;
        return cacheManager;
      };
      return moduleMetadata;
    }

    // 通过函数形式创建 redis 连接配置信息
    const asyncOptions = moduleOptions as RedisModuleAsyncOptions<K>;
    if (typeof asyncOptions.useFactory === 'function') {
      const { useFactory, inject } = asyncOptions;
      if (Array.isArray(inject)) {
        provider.inject.push(...inject);
      }
      provider.useFactory = async (cacheManager: CacheManager, ...args) => {
        const redisOptions = await useFactory(...args);
        const client = await createClient(connectorPackage, redisOptions, cacheManager);
        return client;
      };
      return moduleMetadata;
    }

    // 直接传入 redis 连接配置信息
    const syncOptions = moduleOptions as RedisModuleSyncOptions<K>;
    if (syncOptions.redisOptions && typeof syncOptions.redisOptions === 'object') {
      const { redisOptions } = syncOptions;
      provider.useFactory = async (cacheManager: CacheManager) => {
        const client = await createClient(connectorPackage, redisOptions, cacheManager);
        return client;
      };
      return moduleMetadata;
    }

    throw new Error('无法创建 redis 连接');
  }

  @Inject(RedisClientToken)
  private client: CacheManager | Ioredis | RedisClientType;

  async onModuleDestroy() {
    if ((this.client as Ioredis).quit && typeof (this.client as Ioredis).quit === 'function') {
      await (this.client as Ioredis).quit();
    }
    await (this.client as CacheManager).disconnect();
  }
}
