import mongoose from "mongoose";

const CallSchema = new mongoose.Schema({
  type: { type: String, enum: ["video", "audio"], required: true },

  callMode: { type: String, enum: ["direct", "group"], default: "direct" },

  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },

  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  status: {
    type: String,
    enum: ["ringing", "accepted", "rejected", "ended", "missed"],
    default: "ringing"
  },

  startedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  endedAt: { type: Date },

}, { timestamps: true });

export default mongoose.model("Call", CallSchema);
