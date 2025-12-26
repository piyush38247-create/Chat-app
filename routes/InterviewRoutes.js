import express from "express";
import {
  generateInterviewLink,
  joinMeetingByLink
} from "../controllers/interviewController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:meetingId/invite", auth, generateInterviewLink);

router.get("/join/:token", joinMeetingByLink);

export default router;
