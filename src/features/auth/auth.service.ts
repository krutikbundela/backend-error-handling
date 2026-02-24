import bcrypt from "bcrypt";

import { env } from "../../config/env";
import { ApiError } from "../../utils/apiError";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { hashToken } from "../../utils/hash";
import { UserModel, type UserDocument } from "./auth.model";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface SanitizedUser {
  id: string;
  name: string;
  email: string;
}

interface AuthResult {
  user: SanitizedUser;
  tokens: AuthTokens;
}

const buildTokenSet = (user: UserDocument): AuthTokens => {
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
  };
};

const sanitizeUser = (user: UserDocument): SanitizedUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

const persistRefreshToken = async (
  user: UserDocument,
  refreshToken: string
): Promise<void> => {
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
};

export const registerUser = async (payload: RegisterInput): Promise<AuthResult> => {
  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(payload.password, env.BCRYPT_SALT_ROUNDS);
  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    password: passwordHash,
  });

  const tokens = buildTokenSet(user);
  await persistRefreshToken(user, tokens.refreshToken);

  return {
    user: sanitizeUser(user),
    tokens,
  };
};

export const loginUser = async (payload: LoginInput): Promise<AuthResult> => {
  const user = await UserModel.findOne({ email: payload.email }).select(
    "+password +refreshTokenHash"
  );

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = buildTokenSet(user);
  await persistRefreshToken(user, tokens.refreshToken);

  return {
    user: sanitizeUser(user),
    tokens,
  };
};

export const refreshUserTokenPair = async (
  incomingRefreshToken: string
): Promise<AuthResult> => {
  const payload = verifyRefreshToken(incomingRefreshToken);

  const user = await UserModel.findById(payload.sub).select("+refreshTokenHash");

  if (!user || !user.refreshTokenHash) {
    throw new ApiError(401, "Invalid refresh session");
  }

  const incomingTokenHash = hashToken(incomingRefreshToken);

  if (incomingTokenHash !== user.refreshTokenHash) {
    user.refreshTokenHash = null;
    await user.save();
    throw new ApiError(
      401,
      "Refresh token reuse detected. Please login again."
    );
  }

  const tokens = buildTokenSet(user);
  await persistRefreshToken(user, tokens.refreshToken);

  return {
    user: sanitizeUser(user),
    tokens,
  };
};

export const logoutByUserId = async (userId: string): Promise<void> => {
  await UserModel.findByIdAndUpdate(userId, { refreshTokenHash: null });
};

export const logoutByRefreshToken = async (
  refreshToken: string
): Promise<void> => {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await UserModel.findByIdAndUpdate(payload.sub, { refreshTokenHash: null });
  } catch {
    return;
  }
};
