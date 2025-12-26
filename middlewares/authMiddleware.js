import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TokenBlacklist from "../models/TokenBlacklist.js";

const auth = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ msg: "No token in cookies" });
  }

  try {
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ msg: "Token logged out" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    if (
      user.passwordChangedAt &&
      decoded.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      return res.status(401).json({
        msg: "Password changed. Please login again",
      });
    }

    req.user = { id: user._id };
    req.token = token;
    next();

  } catch (err) {
    return res.status(401).json({ msg: "Token invalid" });
  }
};

export default auth;
