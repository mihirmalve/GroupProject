// routes/userRoutes.js
import express from "express";
import UserController from "../controllers/userController.js";
const router = express.Router();

router.post("/groups", UserController.getUserGroups);
router.post("/getProfile", UserController.getProfile); // future endpoint
router.post("/deleteGroup", UserController.deleteGroup);

export default router;
