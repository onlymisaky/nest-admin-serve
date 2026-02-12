import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../modules/redis/redis.service';
import { CacheResponseInterceptor } from './cache-response.interceptor';
import { ResponseInterceptor } from './response.interceptor';

export function useInterceptors(app: INestApplication) {
  const redisService = app.get(RedisService<'cache-manager'>);
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new CacheResponseInterceptor(reflector, redisService),
    new ResponseInterceptor(),
  );
}
