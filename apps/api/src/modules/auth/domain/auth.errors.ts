import { BaseError } from "@api/shared/errors/base.error";

export class InvalidCredentialsError extends BaseError {
  constructor(message = "Invalid email or password") {
    super(message, "InvalidCredentialsError", 401);
  }
}
