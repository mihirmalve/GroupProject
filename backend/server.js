import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import dbConnect from './services/dbConnect.js';
import compileRoutes from './routes/compileRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import authRoutes from './routes/authRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { app as socketApp, server } from './socket/socket.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config(); // loads .env locally only
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = socketApp;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

dbConnect();

// API Routes
app.use('/', authRoutes);
app.use('/', compileRoutes);
app.use('/', otpRoutes);
app.use('/', groupRoutes);
app.use('/', userRoutes);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
