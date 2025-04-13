import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
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

  // socket.on() is used to listen to the events. can be used both on client and server side
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    // Emit when disconnect
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server, getReceiverSocketId };
