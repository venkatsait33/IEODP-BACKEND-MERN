import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PASSWORD_RESET_TEMPLATE } from "../utils/emailTemplates.js";
import { transporter } from "../utils/nodemailer.js";
import dotenv from "dotenv";
dotenv.config();

export const createUser = asyncHandler(async (req, res) => {
  const {
    userName,
    firstName,
    lastName,
    email,
    password,
    mobileNumber,
    gender,
  } = req.body;

  if (
    !userName ||
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !mobileNumber ||
    !gender
  ) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const userData = {
    userName,
    firstName,
    lastName,
    email,
    password: hashPassword,
    mobileNumber,
    profile: [{ gender }],
  };

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Welcome to IEODP platform",
    html: `<h1>Welcome to our platform</h1> <p>Thank you for joining our platform. We hope you enjoy your experience with us .</p>
            <p> Your account has been created with email id: ${email}
            </p>`,
  };

  await transporter.sendMail(mailOptions);

  const userCreate = await User.create(userData);

  res.status(201).json({
    message: "User created successfully",
    userCreate,
    success: true,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      message: "Please fill all fields",
      success: false,
    });
  }

  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "User not found",
      success: false,
    });
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid password",
      success: false,
    });
  }

  //  Token payload
  const tokenData = {
    id: user._id,
    role: user.role,
  };

  //  Generate JWT
  const token = jwt.sign(tokenData, process.env.JWT_SECRET);

  //  Safe user object (no password)
  const safeUser = {
    _id: user._id,
    userName: user.userName,
    email: user.email,
    role: user.role,
    profile: user.profile,
  };

  //  Send response
  return res
    .status(200)
    .cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
    })
    .json({
      message: "Login successful",
      user: safeUser,
      success: true,
      token,
    });
});

export const sendRestOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required", success: false });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetPasswordOtp = otp;
    user.restOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Rest OTP ",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email,
      ),
      // `<p>Your OTP for resetting your password is: ${otp}</p> <p>This OTP will expire in 15 minutes</p>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const userRestPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all fields", success: false });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    if (String(user.resetPasswordOtp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }
    if (user.restOtpExpireAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordOtp = "";
    user.restOtpExpireAt = 0;
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "SuccessFully Rest-Password ",
      html: `<p> Your account email id: ${email}</p>
            <h1>SuccessFully Rest-Password</h1> <p>Thank you for joining our platform. We hope you enjoy your experience with us .</p>
            `,
    };

    await user.save();
    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "Password reset successfully", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};
