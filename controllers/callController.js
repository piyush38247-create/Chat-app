import Call from "../models/Call.js";

export const startCall = async (req, res) => {
  try {
    const { type, participants, group } = req.body;

    const call = await Call.create({
      type,
      callMode: group ? "group" : "direct",
      participants,
      group,
      host: req.user.id,   // FIXED - REQUIRED
      status: "ringing"
    });

    res.json({ msg: "Call started", call });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


/* ---------------------- ACCEPT CALL ---------------------- */
export const acceptCall = async (req, res) => {
  try {
    const call = await Call.findByIdAndUpdate(
      req.params.callId,
      { status: "accepted", acceptedAt: new Date() },
      { new: true }
    );

    res.json({ msg: "Call accepted", call });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


/* ---------------------- END CALL ---------------------- */
export const endCall = async (req, res) => {
  try {
    const call = await Call.findByIdAndUpdate(
      req.params.callId,
      { status: "ended", endedAt: new Date() },
      { new: true }
    );

    res.json({ msg: "Call ended", call });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


/* ---------------------- MISSED CALL ---------------------- */
export const markMissedCall = async (req, res) => {
  try {
    const call = await Call.findByIdAndUpdate(
      req.params.callId,
      { status: "missed", endedAt: new Date() },
      { new: true }
    );

    res.json({ msg: "Missed Call", call });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


/* ---------------------- CALL HISTORY ---------------------- */
export const getCallHistory = async (req, res) => {
  try {
    const logs = await Call.find({
      participants: req.user.id
    }).sort({ createdAt: -1 });

    res.json(logs);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
