import NotFoundError from '@errors/NotFoundError';
import { Request, Response } from 'express';

const error404Middleware = (req: Request, res: Response) => {
	const error = new NotFoundError();

	res.status(error.statusCode).json({
		...error,
	});
};

export default error404Middleware;
