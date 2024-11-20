import { HttpException, HttpStatus } from '@nestjs/common';

export class RepositoryOperationException extends HttpException {
  error: any;

  constructor(error: any, errMsg?: string) {
    super(errMsg || error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    this.error = error;
  }
}
