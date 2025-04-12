import express from "express";
import GroupController from "../controllers/groupController.js";

const router = express.Router();
router.post("/create", GroupController.createGroup);
router.post("/join", GroupController.joinGroup);


// 🔜 Leave group route will go here in future
// router.post("/leave", protect, GroupController.leaveGroup);

export default router;
