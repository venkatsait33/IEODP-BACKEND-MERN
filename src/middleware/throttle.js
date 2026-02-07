import slowDown from "express-slow-down";

export const throttleRequests = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // begin slowing down responses after 1 request
  delayMs: () => 500, // slow down subsequent responses by 300ms per request
  maxDelayMs: 1000, // slow down subsequent responses by 1000ms per request
});
