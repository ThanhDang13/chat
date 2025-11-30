import { BaseError } from "@api/shared/errors/base.error";

export class NotFoundError extends BaseError {
  constructor(message?: string) {
    super(message ?? "Resource not found", "NotFoundError", 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
