import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { createGroup, getGroup, addMember, deleteGroup, leaveGroup } from "../controllers/groupController.js";
const router = express.Router();
router.post("/", auth, createGroup);
router.get("/:groupId", auth, getGroup);
router.post("/:groupId/add", auth, addMember);
router.delete("/:groupId", auth, deleteGroup);
router.put("/leave/:groupId", auth, leaveGroup);
export default router;

