import { Router } from "express";
import GoogleHomeController from "../controllers/google-home.controller";

const router = Router();
const googleHomeController = new GoogleHomeController();

router.use(googleHomeController.init);
router.post('/intent', googleHomeController.execIntent);

export default router;
