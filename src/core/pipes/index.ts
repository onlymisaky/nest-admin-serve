import { INestApplication, ValidationPipe } from '@nestjs/common';

export function usePipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // 自动删除 DTO 中未定义的属性
    }),
  );
}
