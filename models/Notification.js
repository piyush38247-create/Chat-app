import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  message: String,
  type: { type: String, enum: ["chat", "group", "call"], default: "chat" },
  link: String,
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Notification", NotificationSchema);
