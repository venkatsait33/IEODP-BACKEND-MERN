import { IdempotencyKey } from "../model/IdempotencyKey.js";

export const idempotencyMiddleware = async (req, res, next) => {
  const requestId = req.body.requestId;

  if (!requestId) return next();

  const existing = await IdempotencyKey.findOne({ requestId });

  if (existing) {
    return res.json(existing.response);
  }

  // Wrap res.json to store response
  const originalJson = res.json.bind(res);

  res.json = async (body) => {
    await IdempotencyKey.create({
      requestId,
      userId: req.user._id,
      endpoint: req.originalUrl,
      response: body,
    });

    originalJson(body);
  };

  next();
};
