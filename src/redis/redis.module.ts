import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { RedisClientOptions } from 'redis';
import { createRedisClientFactory } from './create-redis-client.factory';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

interface RedisModuleOptions extends RedisClientOptions {
  // connectorPackage?: 'redis' | 'ioredis'
}

interface RedisModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[]
  useFactory: (...args: any[]) => Promise<RedisModuleOptions> | RedisModuleOptions
}

@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    return {
      global: true,
      module: RedisModule,
      providers: [
        RedisService,
        {
          provide: REDIS_CLIENT,
          useFactory: () => createRedisClientFactory(options),
        },
      ],
      exports: [RedisService, REDIS_CLIENT],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    return {
      global: true,
      module: RedisModule,
      imports: Array.isArray(options.imports) ? options.imports : [],
      providers: [
        RedisService,
        {
          provide: REDIS_CLIENT,
          inject: Array.isArray(options?.inject) ? options.inject : [],
          useFactory: async (...args) => {
            if (typeof options.useFactory === 'function') {
              const config = await options.useFactory(...args);
              return createRedisClientFactory(config);
            }
            else if (typeof options.useFactory === 'object') {
              return createRedisClientFactory(options.useFactory);
            }
            throw new Error('Invalid useFactory');
          },
        },
      ],
      exports: [RedisService, REDIS_CLIENT],
    };
  }
}
