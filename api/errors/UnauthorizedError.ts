import HttpStatus from 'http-status';
import ApiError from './ApiError';
import { ErrorCode } from '@interfaces/types';

class UnauthorizedError extends ApiError {
	constructor(message?: string, code?: ErrorCode) {
		super(message || 'Unauthorized', code || 'UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
	}

}

export default UnauthorizedError;
