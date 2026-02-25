import type { RequestHandler } from "express";

import { ApiError } from "../utils/apiError";
import { verifyAccessToken } from "../utils/jwt";

// ===== AUTH TOKEN EXTRACTION =====
// Access token is expected in `Authorization: Bearer <token>`.
// Keeping extraction in a helper avoids repeating parsing logic.
const extractBearerToken = (authorization?: string): string | null => {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.split(" ")[1];
  return token ?? null;
};

// ===== REQUIRED AUTH MIDDLEWARE =====
// Use this on protected routes where authentication is mandatory.
export const protect: RequestHandler = (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    // We forward errors to global handler using `next(error)` instead of
    // sending response here. This keeps response formatting consistent.
    return next(new ApiError(401, "Authorization token is required"));
  }

  try {
    // Verify signature + expiry, then attach user identity to `req`.
    // Downstream controllers/services can rely on `req.user`.
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
    };
    return next();
  } catch (error) {
    // Invalid/expired tokens are treated as authentication failures.
    return next(error);
  }
};

// ===== OPTIONAL AUTH MIDDLEWARE =====
// Useful for endpoints that work for both guests and logged-in users.
export const optionalProtect: RequestHandler = (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
    };
  } catch {
    // For optional auth we do not fail request on token errors.
    // We simply proceed as unauthenticated.
    req.user = undefined;
  }

  return next();
};
