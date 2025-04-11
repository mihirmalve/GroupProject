import { Router } from "express";
import otpController from "../controllers/otpController.js";

const router = Router()

router.post('/sendOtp',otpController.sendOtp);

export default router;