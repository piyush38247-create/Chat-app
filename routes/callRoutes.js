import express from "express";
import { startCall, acceptCall, endCall, markMissedCall, getCallHistory } from ".././controllers/callController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/start", auth, startCall);
router.put("/accept/:callId", auth, acceptCall);
router.put("/end/:callId", auth, endCall);
router.put("/missed/:callId", auth, markMissedCall);
router.get("/history", auth, getCallHistory);

export default router;