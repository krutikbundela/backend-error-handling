import { randomUUID } from "crypto";

import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env";
import { ApiError } from "./apiError";

// ===== JWT PAYLOAD CONTRACTS =====
// Defining payload interfaces keeps token shape explicit and type-safe.
// `type` field prevents using a refresh token where access token is expected.
export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: "access";
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: "refresh";
  iat?: number;
  exp?: number;
}

// Access token is short-lived and used on protected API calls.
export const generateAccessToken = (userId: string, email: string): string => {
  const payload: AccessTokenPayload = {
    sub: userId,
    email,
    type: "access",
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  });
};

// Refresh token is long-lived and rotated to keep sessions secure.
// `jti` is a unique token id so each issuance is distinct.
export const generateRefreshToken = (userId: string): string => {
  const payload: RefreshTokenPayload = {
    sub: userId,
    jti: randomUUID(),
    type: "refresh",
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  });
};

// ===== TOKEN VERIFICATION HELPERS =====
// These helpers convert any JWT library error into our ApiError shape
// so middleware/controllers receive consistent auth failures.
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

    // Defense in depth: ensure payload declares correct token category.
    if (decoded.type !== "access") {
      throw new ApiError(401, "Invalid access token");
    }

    return decoded;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // We intentionally do not leak exact reason (expired/signature/etc.)
    // to keep auth error responses simple and less informative to attackers.
    throw new ApiError(401, "Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = jwt.verify(
      token,
      env.JWT_REFRESH_SECRET
    ) as RefreshTokenPayload;

    if (decoded.type !== "refresh") {
      throw new ApiError(401, "Invalid refresh token");
    }

    return decoded;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};
