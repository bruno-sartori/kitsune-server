import { ERROR_CODE, ErrorCode } from '@interfaces/types';
import HttpStatus from 'http-status';

class ApiError extends Error {
  public code: string;
  public statusCode: number;

	constructor(message: string, code: ErrorCode = 'API_ERROR', statusCode: number = HttpStatus.UNPROCESSABLE_ENTITY) {
		super(message);

		this.code = ERROR_CODE[code];
		this.statusCode = statusCode;
	}

  public toJSON() {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

export default ApiError;
