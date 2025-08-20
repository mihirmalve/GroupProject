import express from "express";
import groupsController from "../controllers/groupsController.js";

const router = express.Router();

router.post("/create", groupsController.createGroup);
router.post("/join", groupsController.joinGroup);
router.post("/info", groupsController.getGroupInfo);
router.post("/kick", groupsController.kickUser);
router.post("/leave", groupsController.leaveGroup);
router.post("/saveCodeGroup", groupsController.saveCodeGroup);
router.post("/getCodeGroup", groupsController.getCodeGroup);

export default router;
