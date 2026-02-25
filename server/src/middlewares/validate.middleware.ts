import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { z } from "zod";

import { ApiError } from "../utils/apiError";

// This shape lets each route validate only what it needs:
// request body, route params, and/or query string.
interface ValidationSchema {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

// ===== REQUEST VALIDATION MIDDLEWARE FACTORY =====
// Why a factory?
// Each route has different schemas, so we return a middleware instance
// configured with that route's validation rules.
export const validateRequest = (schema: ValidationSchema): RequestHandler => {
  return (req, _res, next) => {
    if (schema.body) {
      const parsedBody = schema.body.safeParse(req.body);
      if (!parsedBody.success) {
        // Use ApiError + next(error) so global error handler formats response.
        return next(
          new ApiError(400, "Validation error", z.flattenError(parsedBody.error))
        );
      }
      // Replace raw input with validated/sanitized data.
      req.body = parsedBody.data;
    }

    if (schema.params) {
      const parsedParams = schema.params.safeParse(req.params);
      if (!parsedParams.success) {
        return next(
          new ApiError(
            400,
            "Validation error",
            z.flattenError(parsedParams.error)
          )
        );
      }
      // Cast is used because Express params typing is broad by default.
      // After validation, we know these values are safe strings.
      req.params = parsedParams.data as Record<string, string>;
    }

    if (schema.query) {
      const parsedQuery = schema.query.safeParse(req.query);
      if (!parsedQuery.success) {
        return next(
          new ApiError(
            400,
            "Validation error",
            z.flattenError(parsedQuery.error)
          )
        );
      }
      // Keep parsed query so controllers read trusted values only.
      req.query = parsedQuery.data as typeof req.query;
    }

    return next();
  };
};
