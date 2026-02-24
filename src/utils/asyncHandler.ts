import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

// ===== ASYNC ERROR WRAPPER =====
// Express does not reliably catch rejected Promises from async handlers
// unless we manually forward errors to `next`.
//
// Instead of writing try/catch in every controller, this utility wraps
// async handlers once and routes errors into global error middleware.
export const asyncHandler = (handler: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
};
