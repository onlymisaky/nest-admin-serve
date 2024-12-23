import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Res } from '@shared/utils/response.utils';
import { Request, Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        return Res.success(request, response, data);
      }),
    );
  }
}
