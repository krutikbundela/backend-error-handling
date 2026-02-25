import type { RequestHandler } from "express";

import { ApiError } from "../utils/apiError";

// ===== 404 FALLBACK =====
// This middleware runs only if no earlier route matched.
// Instead of sending response directly, we pass a typed ApiError
// so global error middleware can keep response format consistent.
export const notFound: RequestHandler = (req, _res, next) => {
  return next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};
