import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Chat from "../models/ChatBot.js";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ⏱ simple in-memory rate limit (per user)
const userLastCall = new Map();
const COOLDOWN = 35000; // 35 sec (Gemini free safe)

export const GeminiChat = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message required" });
    }

    // 🛑 RATE LIMIT CHECK
    const lastTime = userLastCall.get(userId) || 0;
    const now = Date.now();

    if (now - lastTime < COOLDOWN) {
      return res.status(429).json({
        error: "AI busy. Please wait a few seconds ⏳",
      });
    }

    userLastCall.set(userId, now);

    // 🧠 Load last chats
    const previousChats = await Chat.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const historyText = previousChats
      .reverse()
      .map(c => `User: ${c.message}\nAI: ${c.response}`)
      .join("\n");

    const prompt = `
You are a helpful chatbot.
Previous conversation:
${historyText}

User: ${message}
`;

    let answer;

    try {
      // ✅ PRIMARY MODEL
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      answer = result.text;
    } catch (e) {
      // 🔁 FALLBACK MESSAGE (quota hit)
      if (e.status === 429) {
        answer =
          "⚠️ AI thodi busy hai. 1 minute baad try karo 🙂";
      } else {
        throw e;
      }
    }

    await Chat.create({
      userId,
      message,
      response: answer,
    });

    res.json({ answer });

  } catch (err) {
    console.error("Gemini Error:", err);

    res.status(500).json({
      error: "Gemini API failed",
      details: err.message,
    });
  }
};


// Chat history
export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({ userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};
