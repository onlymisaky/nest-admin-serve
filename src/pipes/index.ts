import { INestApplication, ValidationPipe } from '@nestjs/common';

export function usePipes(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe());
}
