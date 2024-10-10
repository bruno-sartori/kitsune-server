import HttpStatus from 'http-status';
import ApiError from './ApiError';

class ResourceNotFoundError extends ApiError {
	constructor() {
		super('Este recurso não foi encontrado ou foi excluído.', 'NOT_FOUND', HttpStatus.NOT_FOUND);
	}

}

export default ResourceNotFoundError;
