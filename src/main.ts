import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useExceptionFilters } from './exceptions';
import { useInterceptors } from './interceptors';
import { usePipes } from './pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  useExceptionFilters(app);
  usePipes(app);
  useInterceptors(app);

  await app.listen(configService.get('server.port') ?? 3000);
}
bootstrap();
