import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  const config = new DocumentBuilder()
    .setTitle('Nest Admin API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  await app.listen(configService.get('server.port') ?? 3000);
}
bootstrap();
