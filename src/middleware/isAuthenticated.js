import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  let token;

  // 1️⃣ Get token
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      message: "User not authenticated",
      success: false,
    });
  }

  // 2️⃣ Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3️⃣ Get user from DB
  const user = await User.findById(decoded.id).select("role");

  if (!user) {
    return res.status(401).json({
      message: "User not found",
      success: false,
    });
  }

  // 4️⃣ Attach user to request
  req.user = {
    _id: user._id,
    role: user.role,
  };

  next();
});
