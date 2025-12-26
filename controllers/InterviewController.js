// controllers/interviewController.js
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Meeting from "../models/Meeting.js";
import sendEmail from "../utils/sendEmail.js";

/* ===============================
   GENERATE INTERVIEW LINK
================================ */
export const generateInterviewLink = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Interviewee email required" });
    }

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({ msg: "Invalid meetingId" });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ msg: "Meeting not found" });
    }

    const inviteToken = jwt.sign(
      {
        meetingId: meeting._id.toString(),
        email: email.toLowerCase(),
        type: "INTERVIEW_INVITE"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const inviteLink = `http://localhost:5000/api/interview/join/${inviteToken}`;

    await sendEmail(
      email,
      "Interview Invitation",
      `You are invited for an interview.

Join using link below:
${inviteLink}

 Valid for 1 hour only.
`
    );

    res.json({ msg: "Interview link sent successfully" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ===============================
   JOIN MEETING BY LINK
================================ */
export const joinMeetingByLink = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "INTERVIEW_INVITE") {
      throw new Error("Invalid invite token");
    }

    if (!mongoose.Types.ObjectId.isValid(decoded.meetingId)) {
      return res.render("joinMeeting", {
        error: "Invalid meeting link",
        meeting: null
      });
    }

    const meeting = await Meeting.findById(decoded.meetingId)
      .populate("host", "name email")
      .populate("members", "name email");

    if (!meeting) {
      return res.render("joinMeeting", {
        error: "Meeting not found",
        meeting: null
      });
    }

    //  user email based auto-join (NO LOGIN REQUIRED)
    res.render("joinMeeting", {
      error: null,
      meeting,
      invitedEmail: decoded.email
    });

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.render("joinMeeting", {
        error: "Interview link expired",
        meeting: null
      });
    }

    return res.render("joinMeeting", {
      error: "Invalid interview link",
      meeting: null
    });
  }
};
