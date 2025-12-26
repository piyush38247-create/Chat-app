import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import path from "path";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import cron from "node-cron";
import { sendMeetingReminders } from "./utils/meetingReminder.js";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import socketHandler from "./socket.js";
import searchRoutes from  './routes/searchRoutes.js'
import chatBotRoutes from "./routes/chatBotRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import meetingRoutes from './routes/meetingRoutes.js'
import InterviewRoutes from './routes/InterviewRoutes.js'
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(cookieParser()); 
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));


app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/call", callRoutes);
app.use('/api/users',searchRoutes)
app.use("/api/chatBot", chatBotRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/meetings", meetingRoutes);
cron.schedule("*/5 * * * *", sendMeetingReminders);
app.use('/api/interview',InterviewRoutes)
app.get("/", (req, res) => res.send("Skype-like backend running"));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
