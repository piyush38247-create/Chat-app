import mongoose from "mongoose";

const chatBotSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    message: { type: String, required: true },
    response: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatBotSchema);
