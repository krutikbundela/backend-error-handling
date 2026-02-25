import type { ErrorRequestHandler } from "express";

import { ZodError, z } from "zod";

import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

interface MongooseLikeError {
  code?: number;
  keyValue?: unknown;
  name?: string;
  message?: string;
  errors?: unknown;
}

// ===== GLOBAL ERROR HANDLING FLOW =====
// Express sends any error passed via `next(error)` to this middleware.
// This gives one consistent response shape for all failures.
//
// Important: this must be registered after routes and other middlewares.
export const globalErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: unknown = undefined;

  if (error instanceof ApiError) {
    // Custom, intentional business/app errors from our own code.
    statusCode = error.statusCode;
    message = error.message;
    errors = error.details;
  } else if (error instanceof ZodError) {
    // Validation issues from schema checks.
    statusCode = 400;
    message = "Validation error";
    errors = z.flattenError(error);
  } else {
    // Handle common Mongoose errors to keep messages beginner-friendly.
    const typedError = error as MongooseLikeError;

    if (typedError.code === 11000) {
      statusCode = 409;
      message = "Duplicate field value";
      errors = typedError.keyValue;
    } else if (typedError.name === "ValidationError") {
      statusCode = 400;
      message = "Validation error";
      errors = typedError.errors;
    } else if (typedError.name === "CastError") {
      statusCode = 400;
      message = "Invalid resource identifier";
    }
  }

  // In production we hide stack traces to avoid leaking internals.
  // In development stack is useful for debugging.
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(env.NODE_ENV !== "production" &&
      error instanceof Error && { stack: error.stack }),
  });
};
