import express from "express";
import authController from "../controllers/authController.js"

const router = express.Router();

router.post("/signup",authController.signupHandler);
router.post("/logout",authController.logoutHandler);
router.post("/signin",authController.loginHandler);
router.post("/checkUserAndEmail",authController.checkUserAndEmailHandler);
router.get("/protect",authController.protectController);

export default router;