import { SetMetadata } from '@nestjs/common';
import { Request, Response } from 'express';

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
