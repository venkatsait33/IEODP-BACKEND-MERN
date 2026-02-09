import express from "express";
import {
  createUser,
  getAssignableUsers,
  getUserById,
  login,
  sendRestOtp,
  userRestPassword,
} from "../controllers/user.controller.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { authLimiter } from "../middleware/authLimiter.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", authLimiter, login);

router.post("/send-rest-otp", authLimiter, sendRestOtp);
router.post("/reset-password", authLimiter, userRestPassword);
router.get(
  "/assignable",
  isAuthenticated,
  authorizeRoles("admin", "leadership", "management"),
  getAssignableUsers,
);

router.get("/:id", getUserById);

export default router;
