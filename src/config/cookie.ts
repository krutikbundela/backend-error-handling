import type { CookieOptions } from "express";

import { env } from "./env";

// ===== COOKIE SECURITY STRATEGY =====
// In production, cookies must be `secure: true` (HTTPS only).
// In local development over HTTP, secure cookies would not be stored.
const isProduction = env.NODE_ENV === "production";

// Refresh token cookie:
// - `httpOnly`: JS in browser cannot read it (mitigates token theft via XSS)
// - `sameSite`: helps protect against CSRF
// - `maxAge`: aligns with refresh token lifetime (7 days)
export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

// Used when logging out to clear the same cookie reliably.
// Path/samesite/secure should match creation options where possible.
export const clearRefreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};
