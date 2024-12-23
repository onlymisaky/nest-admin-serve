import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

export class Res {
  static success<T>(request: Request, response: Response, data: T): T | IResponse<T> {
    const status = response.statusCode;
    response.status(HttpStatus.OK);

    // TODO: 其他类型

    return {
      success: true,
      status,
      data,
      timestamp: new Date().getTime(),
    };
  }

  private static isValidationPipeException(exception: HttpException | any) {
    if (!(exception instanceof BadRequestException)) {
      return false;
    }
    const response = exception.getResponse();
    if (typeof response !== 'object' || !('message' in response)) {
      return false;
    }
    if (!Array.isArray(response.message)) {
      return false;
    }
    if (!exception.stack.includes('ValidationPipe.exceptionFactory')) {
      return false;
    }
    return true;
  }

  static error(
    request: Request,
    response: Response,
    exception: HttpException | any,
    msg?: string,
    data?: any,
  ) {
    const status = exception.getStatus ? exception.getStatus() : response.statusCode;
    const isValidationPipeException = this.isValidationPipeException(exception);
    const message = isValidationPipeException ? '请求参数错误' : msg || exception.message || '服务器错误';
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
      data: isValidationPipeException ? exception.getResponse().message : data,
      timestamp: new Date().getTime(),
    });
  }
}