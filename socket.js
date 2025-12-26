// import Message from "./models/Message.js";
// import Conversation from "./models/Conversation.js";
// import Group from "./models/Group.js";

// const users = new Map();

// export default (io) => {
//   io.on("connection", (socket) => {
//     console.log(" New socket connected:", socket.id);

//     //  REGISTER USER
//     socket.on("register", (userId) => {
//       users.set(userId, socket.id);
//       socket.userId = userId;
//       console.log(`👤 User registered: ${userId} → ${socket.id}`);
//     });
    

//     //  GROUP ROOM JOIN
//     socket.on("joinGroup", (groupId) => {
//       socket.join(groupId);
//       console.log(` ${socket.id} joined group room: ${groupId}`);
//     });

//     //  SEND 1-1 MESSAGE
//     socket.on("sendMessage", async ({ conversationId, content, sender }) => {
//       try {
//         const msg = await Message.create({ conversationId, sender, content });

//         await Conversation.findByIdAndUpdate(conversationId, {
//           lastMessage: content,
//           lastAt: new Date(),
//         });

//         const conversation = await Conversation.findById(conversationId).populate(
//           "participants",
//           "_id"
//         );

//         if (conversation) {
//           conversation.participants.forEach((p) => {
//             const sid = users.get(String(p._id));
//             if (sid) io.to(sid).emit("receiveMessage", msg);
//           });
//         }
//       } catch (err) {
//         console.error(" sendMessage error:", err.message);
//       }
//     });

//     //  SEND GROUP MESSAGE
//     socket.on("sendGroupMessage", async ({ groupId, content, sender }) => {
//       try {
//         const msg = await Message.create({ conversationId: groupId, sender, content });
//         io.to(groupId).emit("receiveGroupMessage", msg);
//       } catch (err) {
//         console.error(" sendGroupMessage error:", err.message);
//       }
//     });

//     //  MARK MESSAGE AS READ
//     socket.on("markRead", async ({ messageId, userId }) => {
//       try {
//         const msg = await Message.findById(messageId);
//         if (!msg) return;

//         if (!msg.readBy.includes(userId)) {
//           msg.readBy.push(userId);
//           await msg.save();
//         }

//         const senderSocket = users.get(String(msg.sender));
//         if (senderSocket) {
//           io.to(senderSocket).emit("messageReadUpdate", {
//             messageId,
//             readBy: msg.readBy,
//           });
//         }
//       } catch (err) {
//         console.error(" markRead error:", err.message);
//       }
//     });

//     //  1-1 WEBRTC CALL SIGNALING
//     socket.on("callUser", ({ to, offer, fromUser }) => {
//       const sid = users.get(to);
//       if (sid) {
//         io.to(sid).emit("incomingCall", {
//           fromUser,
//           offer,
//           time: new Date(),
//           callType: "direct",
//         });
//       }
//     });

//     socket.on("answerCall", ({ to, answer }) => {
//       const sid = users.get(to);
//       if (sid) io.to(sid).emit("callAnswered", { answer });
//     });

//     socket.on("iceCandidate", ({ to, candidate }) => {
//       const sid = users.get(to);
//       if (sid) io.to(sid).emit("iceCandidate", candidate);
//     });


//     //  GROUP CALL MANAGEMENT
//     // User joins group call
//     socket.on("joinGroupCall", ({ groupId, userId }) => {
//       socket.join(`call-${groupId}`);
//       console.log(` ${userId} joined group call ${groupId}`);

//       socket.to(`call-${groupId}`).emit("newPeer", {
//         userId,
//         socketId: socket.id,
//       });
//     });

//     // User leaves group call
//     socket.on("leaveGroupCall", ({ groupId, userId }) => {
//       socket.leave(`call-${groupId}`);
//       console.log(` ${userId} left group call ${groupId}`);

//       socket.to(`call-${groupId}`).emit("removePeer", {
//         userId,
//         socketId: socket.id,
//       });
//     });

//     // Offer
//     socket.on("groupCallOffer", ({ groupId, offer, toSocketId, fromUserId }) => {
//       io.to(toSocketId).emit("groupCallOffer", {
//         offer,
//         fromSocketId: socket.id,
//         fromUserId,
//       });
//     });

//     // Answer
//     socket.on("groupCallAnswer", ({ groupId, answer, toSocketId, fromUserId }) => {
//       io.to(toSocketId).emit("groupCallAnswer", {
//         answer,
//         fromSocketId: socket.id,
//         fromUserId,
//       });
//     });

//     // ICE Candidates
//     socket.on("groupCallICE", ({ groupId, candidate, toSocketId }) => {
//       io.to(toSocketId).emit("groupCallICE", {
//         candidate,
//         fromSocketId: socket.id,
//       });
//     });

//     //  DISCONNECT
//     socket.on("disconnect", () => {
//       if (socket.userId) users.delete(socket.userId);
//       console.log(" Socket disconnected:", socket.id);
//     });
//   });
// };




import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";
import Group from "./models/Group.js";
import Notification from "./models/Notification.js";

const users = new Map();

export default (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 New socket connected:", socket.id);

    // REGISTER USER
    socket.on("register", (userId) => {
      users.set(userId, socket.id);
      socket.userId = userId;
      console.log(`👤 User registered: ${userId} → ${socket.id}`);
    });

    // JOIN GROUP
    socket.on("joinGroup", (groupId) => {
      socket.join(groupId);
      console.log(`📥 ${socket.id} joined group: ${groupId}`);
    });

    // 1-1 MESSAGE
    socket.on("sendMessage", async ({ conversationId, content, sender }) => {
      try {
        const msg = await Message.create({ conversationId, sender, content });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: content,
          lastAt: new Date(),
        });

        const conversation = await Conversation.findById(conversationId).populate(
          "participants",
          "_id"
        );

        if (conversation) {
          conversation.participants.forEach(async (p) => {
            const sid = users.get(String(p._id));
            if (sid) io.to(sid).emit("receiveMessage", msg);

            if (String(p._id) !== sender) {
              // Create Notification
              const notif = await Notification.create({
                user: p._id,
                title: "New Message",
                message: content,
                type: "chat",
                link: `/chat/${conversationId}`,
              });
              if (sid) io.to(sid).emit("receiveNotification", notif);
            }
          });
        }
      } catch (err) {
        console.error("sendMessage error:", err.message);
      }
    });

    // GROUP MESSAGE
    socket.on("sendGroupMessage", async ({ groupId, content, sender }) => {
      try {
        const msg = await Message.create({ conversationId: groupId, sender, content });
        io.to(groupId).emit("receiveGroupMessage", msg);

        const group = await Group.findById(groupId).populate("members", "_id");
        group.members.forEach(async (m) => {
          if (String(m._id) !== sender) {
            const sid = users.get(String(m._id));
            const notif = await Notification.create({
              user: m._id,
              title: "New Group Message",
              message: content,
              type: "group",
              link: `/group/${groupId}`,
            });
            if (sid) io.to(sid).emit("receiveNotification", notif);
          }
        });
      } catch (err) {
        console.error("sendGroupMessage error:", err.message);
      }
    });

    // MARK MESSAGE AS READ
    socket.on("markRead", async ({ messageId, userId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        if (!msg.readBy.includes(userId)) {
          msg.readBy.push(userId);
          await msg.save();
        }

        const senderSocket = users.get(String(msg.sender));
        if (senderSocket) {
          io.to(senderSocket).emit("messageReadUpdate", {
            messageId,
            readBy: msg.readBy,
          });
        }
      } catch (err) {
        console.error("markRead error:", err.message);
      }
    });

    // 1-1 CALL SIGNALING
    socket.on("callUser", async ({ to, offer, fromUser }) => {
      const sid = users.get(to);
      if (sid) {
        io.to(sid).emit("incomingCall", {
          fromUser,
          offer,
          time: new Date(),
          callType: "direct",
        });

        // Notification for call
        const notif = await Notification.create({
          user: to,
          title: "Incoming Call",
          message: `Call from ${fromUser.name}`,
          type: "call",
          link: "/calls",
        });
        io.to(sid).emit("receiveNotification", notif);
      }
    });

    socket.on("answerCall", ({ to, answer }) => {
      const sid = users.get(to);
      if (sid) io.to(sid).emit("callAnswered", { answer });
    });

    socket.on("iceCandidate", ({ to, candidate }) => {
      const sid = users.get(to);
      if (sid) io.to(sid).emit("iceCandidate", candidate);
    });

    // GROUP CALL
    socket.on("joinGroupCall", ({ groupId, userId }) => {
      socket.join(`call-${groupId}`);
      console.log(`🎤 ${userId} joined group call ${groupId}`);
      socket.to(`call-${groupId}`).emit("newPeer", { userId, socketId: socket.id });
    });

    socket.on("leaveGroupCall", ({ groupId, userId }) => {
      socket.leave(`call-${groupId}`);
      console.log(`🚪 ${userId} left group call ${groupId}`);
      socket.to(`call-${groupId}`).emit("removePeer", { userId, socketId: socket.id });
    });

    socket.on("groupCallOffer", ({ toSocketId, offer, fromUserId }) => {
      io.to(toSocketId).emit("groupCallOffer", {
        offer,
        fromSocketId: socket.id,
        fromUserId,
      });
    });

    socket.on("groupCallAnswer", ({ toSocketId, answer, fromUserId }) => {
      io.to(toSocketId).emit("groupCallAnswer", {
        answer,
        fromSocketId: socket.id,
        fromUserId,
      });
    });

    socket.on("groupCallICE", ({ candidate, toSocketId }) => {
      io.to(toSocketId).emit("groupCallICE", {
        candidate,
        fromSocketId: socket.id,
      });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      if (socket.userId) users.delete(socket.userId);
      console.log("❌ Socket disconnected:", socket.id);
    });
  });
};
