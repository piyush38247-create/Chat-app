import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  avatar: { type: String },
}, { timestamps: true });

export default mongoose.model("Group", GroupSchema);
