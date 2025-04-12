// routes/userRoutes.js
import express from "express";
import UserController from "../controllers/userController.js";
const router = express.Router();

router.post("/groups", UserController.getUserGroups);
router.get("/profile", UserController.getProfile); // future endpoint

export default router;
