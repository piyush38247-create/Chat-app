import express from "express";
import { searchUsers, searchGroups, searchChats } from ".././controllers/searchController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/users", auth, searchUsers);
router.get("/groups", auth, searchGroups);
router.get("/chats", auth, searchChats);

export default router;
