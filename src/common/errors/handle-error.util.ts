import { HttpException, HttpStatus } from '@nestjs/common';
import { IBaseResponse } from '@interface/baseResponse';

export function handleError(
  error: unknown,
  defaultMessage = 'Erro interno',
): HttpException {
  if (error instanceof HttpException) {
    const response: IBaseResponse = {
      status: 'error',
      message: error.message,
    };

    return new HttpException(response, error.getStatus());
  }

  const response: IBaseResponse = {
    status: 'error',
    message: defaultMessage,
  };

  return new HttpException(response, HttpStatus.INTERNAL_SERVER_ERROR);
}
