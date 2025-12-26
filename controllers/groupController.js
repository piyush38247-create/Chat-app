import Group from "../models/Group.js";

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !members || members.length < 1) {
      return res.status(400).json({ msg: "Invalid group data" });
    }

    const allMembers = [...new Set([...members, req.user.id])]; // remove duplicates

    const group = await Group.create({
      name,
      members: allMembers,
      admin: req.user.id,
    });

    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// ---------------------- GET GROUPS ----------------------
export const getGroup = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await Group.find({
      members: userId,
    }).populate("members", "name email avatar");

    res.json(groups);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// ---------------------- ADD MEMBER ----------------------
export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const groupId = req.params.groupId;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// ---------------------- DELETE GROUP ----------------------
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (group.admin.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: "Only admin can delete group" });
    }

    await group.deleteOne();
    res.json({ msg: "Group deleted successfully" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// ---------------------- LEAVE GROUP ----------------------
export const leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ msg: "Group not found" });

    // ❌ If user is not in the group → Already left
    if (!group.members.includes(userId)) {
      return res.status(400).json({ msg: "You already left this group" });
    }

    // ✔ If admin is leaving
    if (group.admin.toString() === userId.toString()) {

      // Only 1 member => delete group
      if (group.members.length <= 1) {
        await group.deleteOne();
        return res.json({ msg: "Group deleted because admin left" });
      }

      // Assign new admin (first non-admin member)
      const newAdmin = group.members.find(
        (m) => m.toString() !== userId.toString()
      );
      group.admin = newAdmin;
    }

    // ✔ Remove user from members
    group.members = group.members.filter(
      (m) => m.toString() !== userId.toString()
    );

    await group.save();

    res.json({ msg: "You left the group", group });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

