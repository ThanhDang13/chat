import { BaseError } from "@api/shared/errors/base.error";

export class UnauthorizedError extends BaseError {
  constructor(message?: string) {
    super(message ?? "Unauthorized", "UnauthorizedError", 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
