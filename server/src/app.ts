import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { env } from "./config/env";
import { globalErrorHandler } from "./middlewares/error.middleware";
import { notFound } from "./middlewares/notFound.middleware";
import { apiRouter } from "./routes";

// ===== APP COMPOSITION ROOT =====
// This file wires global middleware and routes.
// Think of it as the "request pipeline definition" for the whole API.
const app = express();

// We allow one or more frontend origins (comma-separated in .env).
// This is useful when switching between local/staging frontends.
const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

// ===== SECURITY MIDDLEWARES (RUN EARLY) =====
// Helmet adds secure HTTP headers (for example disabling MIME sniffing).
// It should run before routes so every response gets safer defaults.
app.use(helmet());

app.use(
  cors({
    // CORS controls which browsers are allowed to call this API.
    // Because we use cookie-based refresh tokens, `credentials: true`
    // is required so browsers can include HTTP-only cookies.
    //
    // If origin is missing (e.g. Postman/server-to-server), we allow it.
    // If origin is present, we allow only whitelisted frontend URLs.
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  })
);

app.use(
  rateLimit({
    // Basic abuse protection: limits repeated requests from same IP.
    // This protects auth endpoints and reduces accidental overload.
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

// ===== REQUEST PARSERS =====
// `express.json` parses JSON bodies.
// We keep a small payload limit to reduce memory abuse risk.
app.use(express.json({ limit: "10kb" }));

// Parses URL-encoded form payloads.
app.use(express.urlencoded({ extended: true }));

// Reads cookies from incoming requests into `req.cookies`.
// Needed for refresh token flow because refresh token lives in cookie.
app.use(cookieParser());

// Lightweight uptime endpoint used by monitoring or load balancers.
app.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "OK",
  });
});

// ===== FEATURE ROUTES =====
// All API routes are namespaced under `/api`.
app.use("/api", apiRouter);

// ===== ERROR PIPELINE ORDER (VERY IMPORTANT) =====
// 1) `notFound` converts unmatched routes into a controlled 404 ApiError.
// 2) `globalErrorHandler` formats ALL thrown/passed errors consistently.
// Express executes middleware in registration order, so these must be last.
app.use(notFound);
app.use(globalErrorHandler);

export default app;
