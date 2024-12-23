import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Res } from '@shared/utils/response.utils';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    if (exception instanceof HttpException) {
      /**
       * 已验证的异常
       * BadRequestException
       * NotFoundException
       */
      Res.error(request, response, exception);
      return;
    }
    if (typeof exception === 'string') {
      Res.error(request, response, exception, exception);
      return;
    }
    if (exception instanceof Error) {
      Res.error(request, response, exception, exception.message);
      return;
    }
    Res.error(request, response, exception, '未知错误');
  }
}
