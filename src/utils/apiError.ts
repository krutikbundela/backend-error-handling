// ===== CUSTOM APPLICATION ERROR =====
// We throw ApiError when we want to control HTTP status + message.
// This keeps business errors explicit and easy to map in global handler.
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;

    // Optional extra details (for example validation error fields).
    // Global error middleware can include this in response JSON.
    this.details = details;

    // Removes constructor noise from stack trace for cleaner debugging.
    Error.captureStackTrace(this, this.constructor);
  }
}
