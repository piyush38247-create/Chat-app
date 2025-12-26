import mongoose from "mongoose";
import Meeting from "../models/Meeting.js";
// CREATE MEETING
export const createMeeting = async (req, res) => {
  try {
    let { title, date, time, members = [] } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ msg: "Title, date & time required" });
    }

    const scheduledAt = new Date(`${date}T${time}`);

    // 🔁 Parse if string
    if (typeof members === "string") {
      members = JSON.parse(members);
    }

    // ✅ Remove invalid / null ids
    members = members.filter(
      (id) => mongoose.Types.ObjectId.isValid(id)
    );

    // ✅ Remove duplicate & host
    members = [...new Set(members)].filter(
      (id) => id.toString() !== req.user.id.toString()
    );

    const meeting = await Meeting.create({
      title,
      scheduledAt,
      host: req.user.id,
      members
    });

    res.json({ msg: "Meeting created", meeting });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
// ADD MEMBER
export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const { meetingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid userId" });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ msg: "Meeting not found" });
    }

    // ✅ remove nulls if already present
    meeting.members = meeting.members.filter(Boolean);

    const alreadyMember = meeting.members.some(
      (m) => m && m.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({
        msg: "User already exists in this meeting"
      });
    }

    meeting.members.push(userId);
    await meeting.save();

    res.json({
      msg: "Member added successfully",
      meeting
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// GET MY MEETINGS
export const getMyMeetings = async (req, res) => {
  const meetings = await Meeting.find({
    $or: [
      { host: req.user.id },
      { members: req.user.id }
    ]
  }).sort({ scheduledAt: 1 });

  res.json(meetings);
};

// START MEETING
export const startMeeting = async (req, res) => {
  const meeting = await Meeting.findById(req.params.meetingId);

  if (!meeting) return res.status(404).json({ msg: "Meeting not found" });

  const now = new Date();
  if (now < meeting.scheduledAt) {
    return res.status(400).json({ msg: "Meeting not started yet" });
  }

  meeting.status = "ongoing";
  await meeting.save();

  res.json({ msg: "Meeting started", meeting });
};

// END MEETING
export const endMeeting = async (req, res) => {
  const meeting = await Meeting.findById(req.params.meetingId);
  meeting.status = "ended";
  await meeting.save();

  res.json({ msg: "Meeting ended" });
};
