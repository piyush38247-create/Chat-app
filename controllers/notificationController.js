import mongoose from "mongoose";
import Notification from "../models/Notification.js";
// Create a notification
export const createNotification = async ({ userId, title, message, type, link }) => {
  try {
    const notif = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
    });
    return notif;
  } catch (err) {
    console.error("createNotification error:", err.message);
    throw err;
  }
};

// Get notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notif = await Notification.findById(notificationId);
    if (!notif) return res.status(404).json({ message: "Notification not found" });

    notif.isRead = true;
    await notif.save();

    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
