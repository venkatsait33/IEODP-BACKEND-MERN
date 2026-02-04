import express from "express";
import {
  createUser,
  getAssignableUsers,
  login,
  sendRestOtp,
  userRestPassword,
} from "../controllers/user.controller.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", login);

router.post("/send-rest-otp", sendRestOtp);
router.post("/reset-password", userRestPassword);
router.get(
  "/assignable",
  isAuthenticated,
  authorizeRoles("admin", "leadership", "management"),
  getAssignableUsers,
);

export default router;
