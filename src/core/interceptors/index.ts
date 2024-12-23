import { INestApplication } from '@nestjs/common';
import { ResponseInterceptor } from './response.interceptor';

export function useInterceptors(app: INestApplication) {
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
  );
}
