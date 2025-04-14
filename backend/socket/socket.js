import { Server } from "socket.io";
import http from "http";
import express from "express";
import cookie from "cookie";
import messageModel from "../models/messageModel.js";
import groupModel from "../models/groupModel.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // {userId: socketId}

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  const cookieHeader = socket.handshake.headers.cookie;

  if (!cookieHeader) {
    console.log("❌ No cookies, disconnecting socket:", socket.id);
    socket.disconnect();
    return;
  }

  const parsedCookies = cookie.parse(cookieHeader);
  const jwt = parsedCookies.jwt;

  if (!jwt) {
    console.log(
      "❌ JWT token not found in cookies, disconnecting socket:",
      socket.id
    );
    socket.disconnect();
    return;
  }

  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId != "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // Emit when concect
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Join the group room
  socket.on("joinGroup", async (groupId) => {
    socket.join(groupId);
    try {
      const group = await groupModel.findById(groupId);

      if (!group) {
        return socket.emit("error", { message: "Group not found" });
      }

      const group2 = await group.populate("messages");
      socket.emit("previousMessages", group.messages);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // Leave the group room
  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
  });

  // When user is typing
  socket.on("typing", (data) => {
    const { groupId, userId } = data;
    socket.to(groupId).emit("typing", { userId });
  });

  // When user stop typing
  socket.on("stopTyping", (data) => {
    const { groupId, userId } = data;
    socket.to(groupId).emit("stopTyping", { userId });
  });

  // When user send message
  socket.on("sendMessage", async (data) => {
    try {
      const { username, groupId, messageContent, userId } = data;

      // Save the message to the database
      const message = new messageModel({
        sendername: username,
        sender: userId,
        group: groupId,
        message: messageContent,
      });

      await message.save();

      // Now, update the group with this new message
      const group = await groupModel.findById(groupId);
      group.messages.push(message._id);
      await group.save();

      // Emit the new message to all users in this group
      io.to(groupId).emit("newMessage", message);
    } catch (error) {
      socket.emit("error", { message: "Failed to send the message." });
    }
  });

  // socket.on() is used to listen to the events. can be used both on client and server side
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    // Emit when disconnect
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server, getReceiverSocketId };
