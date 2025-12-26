import express from "express";
import {  GeminiChat, getChatHistory } from "../controllers/chatBotController.js";

const router = express.Router();

router.post("/chats", GeminiChat);

router.get("/history/:userId", getChatHistory);

export default router;
