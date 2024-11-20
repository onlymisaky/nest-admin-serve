import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { Res } from '../utils/response.utils';
import { RepositoryOperationException } from './repository-operation.exception';

@Catch(RepositoryOperationException)
export class RepositoryOperationFilter implements ExceptionFilter {
  catch(exception: RepositoryOperationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    Res.error(request, response, exception);
  }
}
