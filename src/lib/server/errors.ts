/**
 * Lumora error envelope.
 *
 * Every API failure returns the same shape:
 *   { error: { code: string, message: string, details?: unknown } }
 * Services throw `AppError`; everything else is mapped to INTERNAL (500).
 */

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'UNPROCESSABLE'
  | 'INTERNAL';

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 400,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }

  static unauthorized(message = 'You must be signed in.') {
    return new AppError('UNAUTHORIZED', message);
  }
  static forbidden(message = 'You do not have permission to do that.') {
    return new AppError('FORBIDDEN', message);
  }
  static notFound(message = 'Not found.') {
    return new AppError('NOT_FOUND', message);
  }
  static validation(message: string, details?: unknown) {
    return new AppError('VALIDATION', message, details);
  }
  static conflict(message: string) {
    return new AppError('CONFLICT', message);
  }
  static rateLimited(message = 'Too many requests. Please slow down.') {
    return new AppError('RATE_LIMITED', message);
  }
  static unprocessable(message: string) {
    return new AppError('UNPROCESSABLE', message);
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}

/** Normalize any thrown value into an AppError. */
export function toAppError(e: unknown): AppError {
  if (isAppError(e)) return e;
  if (e instanceof Error && e.name === 'ZodError') {
    return AppError.validation('Invalid request payload.', (e as { issues?: unknown }).issues);
  }
  if (e instanceof Error) {
    return new AppError('INTERNAL', 'An unexpected error occurred.', {
      message: e.message,
    });
  }
  return new AppError('INTERNAL', 'An unexpected error occurred.');
}
