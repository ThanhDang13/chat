import { BaseError } from "@api/shared/errors/base.error";

export class ForbiddenError extends BaseError {
  constructor(message?: string) {
    super(
      message ?? "Forbidden",
      "ForbiddenError",
      403 // HTTP status for forbidden access
    );
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
