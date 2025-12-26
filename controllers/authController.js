import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import jwt from  'jsonwebtoken'
import TokenBlacklist from "../models/TokenBlacklist.js";
export const register = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: "Missing fields" });

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ msg: "User exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      avatar,
    });

    res.json({
      msg: "User registered",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// LOGIN WITH COOKIE
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user._id);

    // Set token inside HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true if using HTTPS
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      msg: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET LOGGED IN USER
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// // LOGOUT

export const logout = async (req, res) => {
  try {
    const token = req.token;

    const decoded = jwt.decode(token);

    await TokenBlacklist.create({
      token,
      expiresAt: new Date(decoded.exp * 1000)
    });

    // 🍪 clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict"
    });

    res.json({ msg: "Logout successful" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
// chnage password

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ msg: "New passwords do not match" });
    }
    const user = await User.findById(req.
      user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({ msg: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// forget passsowrd

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ msg: "If email exists, reset link sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `http://localhost:5000/api/auth/reset-password/${resetToken}`;

    const message = `
You requested a password reset.

Click the link below:
${resetUrl}

This link is valid for 15 minutes.
`;

    await sendEmail(user.email, "Password Reset", message);

    res.json({ msg: "Password reset link sent to email" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

//  Reset Password 
export const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    //  logout all devices
    user.passwordChangedAt = new Date();

    await user.save();

    res.json({ msg: "Password reset successful. Please login again." });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
