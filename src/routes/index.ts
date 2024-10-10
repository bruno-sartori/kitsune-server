import { Request, Response, Router } from 'express';
import authRoute from './auth.route';
import googleHomeRoute from './google-home.route';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  console.log(req.user);
  res.status(200).json({ message: 'Hello World!' });
});

router.use('/auth', authRoute);
router.use('/google-home', googleHomeRoute);

export default router;
