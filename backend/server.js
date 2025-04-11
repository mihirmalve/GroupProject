// server.js
import compileRoutes from './routes/compileRoutes.js'
import otpRoutes from './routes/otpRoutes.js'
import authRoutes from './routes/authRoutes.js'
import express from 'express';
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import dbConnect from "./services/dbConnect.js"

dotenv.config()

const app = express();
app.use(cors({
  origin: "http://localhost:3000",  // your frontend URL
  credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

const PORT = process.env.PORT || 8000

dbConnect()

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.use("/", authRoutes)
app.use('/',compileRoutes)
app.use('/',otpRoutes)


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
