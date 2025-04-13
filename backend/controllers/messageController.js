import groupModel from "../models/groupModel.js";
import messageModel from "../models/messageModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

class messageController {
    async sendMessage(req, res) {
        try {
            const { senderId, groupId, message } = req.body;   

            const group = await groupModel.findById(groupId);

            if (!group) {
                return res.status(404).json({ message: "Group not found" });
            } 

            const newMessage = await messageModel.create({
                sender: senderId,
                group: groupId,
                message
            });

            group.messages.push(newMessage._id);
            await group.save();

            const allReceiverSocketId = [];

            for (const member of group.members) {
              if (member !== senderId) {
                const socketId = await getReceiverSocketId(member);
                if (socketId) {
                  allReceiverSocketId.push(socketId);
                }
              }
            }

            io.to(allReceiverSocketId).emit("message", newMessage);            

            return res.status(200).json({ message: "Message sent successfully" });

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getMessages(req, res) {
        try {
            const { groupId } = req.params;
            const group = await groupModel.findById(groupId);

            if (!group) {
                return res.status(404).json({ message: "Group not found" });
            } 

            const messages = group.messages;
            return res.status(200).json(messages);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

export default new messageController();