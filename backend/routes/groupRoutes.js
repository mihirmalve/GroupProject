import express from "express";
import GroupController from "../controllers/GroupController.js";

const router = express.Router();

router.post("/create", GroupController.createGroup);
router.post("/join", GroupController.joinGroup);
router.post("/info", GroupController.getGroupInfo);
router.post("/kick", GroupController.kickUser);
router.post("/leave", GroupController.leaveGroup);
router.post("/saveCodeGroup", GroupController.saveCodeGroup);
router.post("/getCodeGroup", GroupController.getCodeGroup);

export default router;
