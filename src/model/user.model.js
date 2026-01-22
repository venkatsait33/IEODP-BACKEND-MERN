import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      gender: {
        type: String,
        enum: ["MALE", "FEMALE", "OTHER"],
      },
      photo: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: ["operator", "admin", "leadership", "management", "auditor"],
      default: "operator",
    },
    mobileNumber: {
      type: Number,
    },
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "pending", "suspended"],
      default: "active",
    }, 
    resetPasswordOtp: {
      type: String,
      default: "",
    },
    restOtpExpireAt: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", UserSchema);
