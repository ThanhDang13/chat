export abstract class BaseError extends Error {
  public readonly name: string;
  public readonly httpStatus: number;

  constructor(message: string, name: string, httpStatus: number) {
    super(message);
    this.name = name;
    this.httpStatus = httpStatus;
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}
