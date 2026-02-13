import { SetMetadata } from '@nestjs/common';
import { Request, Response } from 'express';
import { RedisService } from '../modules/redis/redis.service';

export const CACHE_METADATA = 'cache_metadata';

export interface CacheMetadata {
  cacheKey: string | ((req: Request, res: Response) => string)
  ttlSeconds: number
}

export function CacheResponse(
  cacheKey: string | ((req: Request, res: Response) => string),
  ttlSeconds = 600,
) {
  return SetMetadata(CACHE_METADATA, { cacheKey, ttlSeconds } as CacheMetadata);
}

export interface CacheResultOptions {
  redisServiceName?: string
  ttlSeconds?: number
  format?: boolean
}

export function CacheResult<T extends (...args: any[]) => any>(
  cacheKey: string | ((...args: Parameters<T>) => string),
  options: CacheResultOptions = {},
) {
  const { ttlSeconds = 600, format = true, redisServiceName = 'redisService' } = options;

  return function (
    _cls: any,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const originalMethod = descriptor.value;
    if (!originalMethod || typeof originalMethod !== 'function')
      return descriptor;

    descriptor.value = (async function (...args: Parameters<T>): Promise<ReturnType<T>> {
      const self = this as { [key: string]: RedisService<'cache-manager'> };
      const redisService = self[redisServiceName];

      if (!redisService)
        return originalMethod.apply(this, args);

      const key = typeof cacheKey === 'function' ? cacheKey(...args) : cacheKey;

      if (!key)
        return originalMethod.apply(this, args);

      const cached = await redisService.get(key, format);

      if (cached !== undefined && cached !== null)
        return cached as ReturnType<T>;

      const res = await originalMethod.apply(this, args);
      await redisService.set(key, format ? JSON.stringify(res) : res, ttlSeconds);
      return res;
    }) as T;

    return descriptor;
  };
}
