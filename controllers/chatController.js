import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export const createConversation = async (req, res) => {
  try {
    const { participants } = req.body; // array of userIds
    if (!participants || participants.length < 2) return res.status(400).json({ msg: "Need participants" });

    const conv = await Conversation.create({ participants });
    res.json(conv);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const msg = await Message.create({ conversationId, content, sender: req.user.id });
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: content, lastAt: new Date() });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId }).populate("sender", "name email avatar");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const convs = await Conversation.find({ participants: req.user.id }).sort({ lastAt: -1 }).populate("participants", "name email avatar");
    res.json(convs);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};




export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.body;

    if (!messageId) return res.status(400).json({ msg: "messageId required" });

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ msg: "Message not found" });

    // Already read?
    if (!msg.readBy.includes(req.user.id)) {
      msg.readBy.push(req.user.id);
      await msg.save();
    }

    res.json({
      msg: "Message marked as read",
      message: msg
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};



export const getUnreadCount = async (req, res) => {
  try {
    const unread = await Message.countDocuments({
      sender: { $ne: req.user.id },
      readBy: { $ne: req.user.id }
    });

    res.json({ unread });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};



export const getUnreadByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const unread = await Message.countDocuments({
      conversationId,
      sender: { $ne: req.user.id },
      readBy: { $ne: req.user.id }
    });

    res.json({ conversationId, unread });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};



export const sendFileMessage = async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!req.file)
      return res.status(400).json({ msg: "File required" });

    const fileUrl = "uploads/files/" + req.file.filename;

    const msg = await Message.create({
      conversationId,
      sender: req.user.id,
      fileUrl,
      fileType: req.file.mimetype,
      content: " File attached"
    });

    await Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: " File message", lastAt: new Date() }
    );

    res.json({ msg: "File message sent", message: msg });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};