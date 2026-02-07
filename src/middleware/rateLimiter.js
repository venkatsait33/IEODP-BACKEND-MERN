import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis.js";

export const globalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimit.ipKeyGenerator,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

// export const userLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   keyGenerator: (req) => req.user?.id || req.ip,
// });
