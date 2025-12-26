import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { createConversation, sendMessage, getMessages, getConversations, markAsRead, getUnreadCount, getUnreadByConversation, sendFileMessage } from "../controllers/chatController.js";
import fileUpload from "../utils/multer.js";

const router = express.Router();


router.post("/conversation", auth, createConversation);
router.get("/conversations", auth, getConversations);
router.post("/send", auth, sendMessage);
router.get("/messages/:conversationId", auth, getMessages);

router.post("/read-message", auth, markAsRead);
router.get("/unread-count", auth, getUnreadCount);
router.get("/unread/:conversationId", auth, getUnreadByConversation);


router.post("/message/file", auth, fileUpload.single("file"), sendFileMessage);

export default router;
