import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, tap } from 'rxjs';
import { CACHE_METADATA, CacheMetadata } from '../decorators/cache.decorator';
import { RedisService } from '../modules/redis/redis.service';

@Injectable()
export class CacheResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService<'cache-manager'>,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const target = context.getHandler();
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const metadata = this.reflector.get<CacheMetadata>(CACHE_METADATA, target);

    if (!metadata)
      return next.handle();

    const ttl = metadata.ttlSeconds ?? 600;
    const cacheKey = typeof metadata.cacheKey === 'function'
      ? metadata.cacheKey(req, res)
      : metadata.cacheKey;

    if (!cacheKey) {
      return next.handle();
    }

    const cached = await this.redisService.get(cacheKey, true);

    if (undefined !== cached && cached !== null) {
      return of(cached);
    }

    return next.handle().pipe(
      tap((data) => {
        this.redisService.set(cacheKey, JSON.stringify(data), ttl);
      }),
    );
  }
}
