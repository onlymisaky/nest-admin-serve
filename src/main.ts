import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useExceptionFilters } from 'src/core/exceptions';
import { useInterceptors } from 'src/core/interceptors';
import { usePipes } from 'src/core/pipes';
import { AppModule } from './app.module';
import { getConfig } from './config/configuration';

async function bootstrap() {
  try {
    getConfig();
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
  catch (error) {
    console.error('配置验证失败:', error.message);
    process.exit(1);
  }
}
bootstrap();
