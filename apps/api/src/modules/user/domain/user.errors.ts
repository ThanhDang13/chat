import { BaseError } from "@api/shared/errors/base.error";

export class EmailAlreadyExistsError extends BaseError {
  constructor(email: string) {
    super(`User with email ${email} already exists`, "EmailAlreadyExistsError", 409);
    Object.setPrototypeOf(this, EmailAlreadyExistsError.prototype);
  }
}
