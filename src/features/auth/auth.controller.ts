import type { RequestHandler } from "express";

import {
  clearRefreshTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../../config/cookie";
import { ApiError } from "../../utils/apiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  loginUser,
  logoutByRefreshToken,
  logoutByUserId,
  refreshUserTokenPair,
  registerUser,
} from "./auth.service";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

const setRefreshCookie = (res: Parameters<RequestHandler>[1], token: string): void => {
  res.cookie("refreshToken", token, refreshTokenCookieOptions);
};

const clearRefreshCookie = (res: Parameters<RequestHandler>[1]): void => {
  res.clearCookie("refreshToken", clearRefreshTokenCookieOptions);
};

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const payload = req.body as RegisterBody;

  const result = await registerUser(payload);

  setRefreshCookie(res, result.tokens.refreshToken);

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const payload = req.body as LoginBody;

  const result = await loginUser(payload);

  setRefreshCookie(res, result.tokens.refreshToken);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

export const refreshToken: RequestHandler = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken as string | undefined;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  const result = await refreshUserTokenPair(incomingRefreshToken);

  setRefreshCookie(res, result.tokens.refreshToken);

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

export const logout: RequestHandler = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;

  if (req.user?.id) {
    await logoutByUserId(req.user.id);
  } else if (refreshToken) {
    await logoutByRefreshToken(refreshToken);
  }

  clearRefreshCookie(res);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});
