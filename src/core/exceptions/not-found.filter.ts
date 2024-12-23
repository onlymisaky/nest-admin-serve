import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { Res } from '@shared/utils/response.utils';
import { Request, Response } from 'express';

@Catch(NotFoundException)
export class NotFoundFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    Res.error(request, response, exception);
  }
}
