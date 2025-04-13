import express from "express";
import messageController from "../controllers/messageController.js"

const router = express.Router();

router.post("/send",messageController.sendMessage);
router.get("/get/:groupId",messageController.getMessages);

export default router;