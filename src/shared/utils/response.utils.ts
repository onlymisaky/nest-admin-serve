import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

export class Res {
  private static res<T>(success: boolean, status: number, data: T, message: string = '') {
    return {
      success,
      status,
      data,
      message,
      timestamp: new Date().getTime(),
    };
  }

  static success<T>(request: Request, response: Response, data: T): T | IResponse<T> {
    const status = response.statusCode;
    response.status(HttpStatus.OK);

    // TODO: 其他类型

    return this.res(true, status, data);
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
    // 有时候错误信息不能描述具体的错误原因，调用方可以根据 data 来判断具体错误，从而进行处理
    const msgData = isValidationPipeException ? exception.getResponse().message : data;
    const res = this.res(false, status, msgData, message);

    response.status(HttpStatus.OK).json(res);
  }
}
