import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  online: { type: Boolean, default: false },
   passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
