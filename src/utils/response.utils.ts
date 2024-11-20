import { HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

export class Res {
  static success<T>(request: Request, response: Response, data: T): T | IResponse<T> {
    const status = response.statusCode;
    response.status(HttpStatus.OK);

    if (data instanceof Blob) {
      return data;
    }

    return {
      success: true,
      status,
      data,
      timestamp: new Date().getTime(),
    };
  }

  static error(
    request: Request,
    response: Response,
    exception: HttpException | any,
    msg?: string,
    data?: any,
  ) {
    const status = exception.getStatus ? exception.getStatus() : response.statusCode;
    const message = msg || exception.message || '服务器错误';
    response.status(HttpStatus.OK).json({
      success: false,
      status,
      message,
      request: {
        method: request.method,
        url: request.url,
        body: request.body,
        params: request.params,
        query: request.query,
      },
      data,
      timestamp: new Date().getTime(),
    });
  }
}
