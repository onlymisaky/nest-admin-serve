import { INestApplication } from '@nestjs/common';
import { AllExceptionFilter } from './all.filter';

export function useExceptionFilters(app: INestApplication) {
  // 从后往前执行，只会执行第一个匹配的过滤器
  app.useGlobalFilters(
    new AllExceptionFilter(),
    // new BadRequestFilter(),
    // new NotFoundFilter(),
    // new RepositoryOperationFilter(),
  );
}
