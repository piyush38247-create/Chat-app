import express from "express";
import auth from "../middlewares/authMiddleware.js";
import {
  createMeeting,
  addMember,
  getMyMeetings,
  startMeeting,
  endMeeting
} from "../controllers/meetingController.js";

const router = express.Router();

router.post("/", auth, createMeeting);
router.post("/:meetingId/add-member", auth, addMember);
router.get("/", auth, getMyMeetings);
router.post("/:meetingId/start", auth, startMeeting);
router.post("/:meetingId/end", auth, endMeeting);

export default router;
