import express from "express";
import {
  createUser,
  login,
  sendRestOtp,
  userRestPassword,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", login);

router.post("/send-rest-otp", sendRestOtp);
router.post("/reset-password", userRestPassword);

export default router;
