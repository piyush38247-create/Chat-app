import express from "express";
import { createNotification, getNotifications, markAsRead } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, title, message, type, link } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ message: "userId, title, and message are required" });
    }

    const notif = await createNotification({ userId, title, message, type, link });
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/:userId", getNotifications);

router.patch("/:notificationId/read", markAsRead);

export default router;
