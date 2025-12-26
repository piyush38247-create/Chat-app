import Meeting from "../models/Meeting.js";
import Notification from "../models/Notification.js";

export const sendMeetingReminders = async () => {
  try {
    const now = new Date();
    const next10Min = new Date(now.getTime() + 10 * 60000);

    const meetings = await Meeting.find({
      scheduledAt: { $gte: now, $lte: next10Min },
      status: "scheduled",
      reminderSent: false 
    });

    const notifications = [];

    for (let m of meetings) {
      const users = [m.host, ...m.members];

      for (let userId of users) {
        notifications.push({
          user: userId,
          title: "Meeting Reminder",
          message: `Meeting "${m.title}" starts soon`,
          type: "call",
          link: m.meetingLink,
        });
      }

      // mark reminder sent
      m.reminderSent = true;
      await m.save();
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications); 
    }

    console.log("Meeting reminders sent");

  } catch (err) {
    console.error("Cron error:", err.message);
  }
};
