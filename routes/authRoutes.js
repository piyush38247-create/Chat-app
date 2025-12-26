import express from "express";
import { register, login, me, getAllUsers, changePassword, forgotPassword, resetPassword, logout } from "../controllers/authController.js";
import auth from "../middlewares/authMiddleware.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);
router.get('/getAll',auth,getAllUsers)
router.post("/change-password", auth, changePassword);



router.post("/forgot-password", forgotPassword);

//  Render EJS reset password page
router.get("/reset-password/:token", (req, res) => {
  res.render("reset-password", {
    token: req.params.token,
    error: null,
    success: null
  });
});

//  Handle reset password form submit
router.post("/reset-password/:token", resetPassword);

router.post("/logout", auth, logout);

export default router;
