import express from "express";
import GroupController from "../controllers/groupController.js";

const router = express.Router();
router.post("/create", GroupController.createGroup);
router.post("/join", GroupController.joinGroup);
router.post("/info", GroupController.getGroupInfo);
router.post("/kick", GroupController.kickUser);
router.post("/leave", GroupController.leaveGroup);

export default router;
