import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 create account requests per `window` (here, per 15 minutes)
  message: {
    message:
      "Too many accounts created from this IP, please try again after 15 minutes",
  },
});
