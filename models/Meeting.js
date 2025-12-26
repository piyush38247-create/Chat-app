import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  title: String,
  scheduledAt: Date,
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: {
    type: String,
    enum: ["scheduled", "ongoing", "ended"],
    default: "scheduled"
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("Meeting", meetingSchema);
