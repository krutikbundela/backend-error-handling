import { config } from "dotenv";
import { z } from "zod";

// ===== ENV LOADING =====
// Reads .env values into process.env as early as possible.
config();

// ===== ENV VALIDATION (FAIL FAST) =====
// Using Zod here gives:
// 1) runtime validation
// 2) strongly typed `env` object for the rest of the app
// 3) clearer startup errors when config is missing/wrong
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
});

// `safeParse` avoids throwing immediately and lets us print readable errors.
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // Flattened errors are beginner-friendly and easy to debug in terminal logs.
  console.error(
    "Environment validation failed:",
    z.flattenError(parsedEnv.error).fieldErrors
  );
  throw new Error("Invalid environment variables");
}

// Export a single trusted source for app config.
// After this point, avoid reading raw process.env directly in features.
export const env = parsedEnv.data;
