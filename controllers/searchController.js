import User from "../models/User.js";
import Group from "../models/Group.js";
import Conversation from "../models/Conversation.js";

export const searchUsers = async (req, res) => {
  try {
    const q = req.query.q || "";

    const users = await User.find({
      $or: [
        { name: new RegExp(q, "i") },
        { email: new RegExp(q, "i") }
      ]
    }).select("name email avatar");

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


export const searchGroups = async (req, res) => {
  try {
    const q = req.query.q || "";

    const groups = await Group.find({
      name: new RegExp(q, "i"),
      members: req.user.id       
    });

    res.json(groups);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


export const searchChats = async (req, res) => {
  try {
    const q = req.query.q || "";

    const chats = await Conversation.find({
      participants: req.user.id,
      lastMessage: { $regex: q, $options: "i" }
    });

    res.json(chats);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
