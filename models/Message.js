import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  fileUrl: { type: String },
fileType: { type: String },

}, { timestamps: true });

export default mongoose.model("Message", MessageSchema);
