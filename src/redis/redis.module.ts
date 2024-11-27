import { DynamicModule, FactoryProvider, Inject, Module, ModuleMetadata, OnModuleDestroy, Provider } from '@nestjs/common';
import Ioredis from 'ioredis';
import { RedisClientType } from 'redis';
import { createClientFactory } from './create-client';
import { ClientOptions, ConnectorPackage, FactoryOptions } from './create-client/utils';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

export type RedisModuleOptions<K extends ConnectorPackage> = {
  isGlobal?: boolean
  connectorPackage?: K
  redisOptions: ClientOptions<K>
} & FactoryOptions;

export type RedisModuleAsyncOptions<K extends ConnectorPackage> = {
  isGlobal?: boolean
  inject?: any[]
  connectorPackage?: K
  useFactory: (...args: any[]) => Promise<ClientOptions<K>> | ClientOptions<K>
} & FactoryOptions & Pick<ModuleMetadata, 'imports'>;

function createRedisModule(isGlobal?: boolean) {
  const moduleMetadata: DynamicModule = {
    global: !!isGlobal,
    module: RedisModule,
    providers: [
      RedisService,
      {
        provide: REDIS_CLIENT,
        useFactory: () => { return null; },
      },
    ],
    exports: [RedisService, REDIS_CLIENT],
  };

  return moduleMetadata;
}

function findRedisClientProvider(providers: Provider[]) {
  return providers.find((provider: FactoryProvider) => provider.provide && provider.provide === REDIS_CLIENT) as FactoryProvider;
}

@Module({})
export class RedisModule implements OnModuleDestroy {
  static forRoot<K extends ConnectorPackage>(options: RedisModuleOptions<K>): DynamicModule {
    return this.register({ ...options, isGlobal: true });
  }

  static forRootAsync<K extends ConnectorPackage>(options: RedisModuleAsyncOptions<K>): DynamicModule {
    return this.registerAsync({ ...options, isGlobal: true });
  }

  static register<K extends ConnectorPackage>(options: RedisModuleOptions<K>): DynamicModule {
    const { connectorPackage, isGlobal, redisOptions, ...factoryOptions } = options;

    const moduleMetadata = createRedisModule(isGlobal);
    const provider = findRedisClientProvider(moduleMetadata.providers);

    if (provider) {
      provider.useFactory = () => createClientFactory(connectorPackage, factoryOptions, redisOptions);
    }

    return moduleMetadata;
  }

  static registerAsync<K extends ConnectorPackage>(options: RedisModuleAsyncOptions<K>): DynamicModule {
    const { isGlobal, imports, inject, useFactory, connectorPackage, ...factoryOptions } = options;
    const moduleMetadata = createRedisModule(isGlobal);
    moduleMetadata.imports = Array.isArray(imports) ? imports : [];
    const provider = findRedisClientProvider(moduleMetadata.providers);

    if (provider) {
      if (Array.isArray(inject)) {
        provider.inject = inject;
      }
      provider.useFactory = async (...args) => {
        if (typeof useFactory === 'function') {
          const redisOptions = await useFactory(...args);
          return createClientFactory(connectorPackage, factoryOptions, redisOptions);
        }
        else if (typeof useFactory === 'object') {
          return createClientFactory(connectorPackage, factoryOptions, useFactory);
        }
        throw new Error('Invalid RedisModule useFactory');
      };
    }

    return moduleMetadata;
  }

  @Inject(REDIS_CLIENT)
  private redisClient: RedisClientType | Ioredis;

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
