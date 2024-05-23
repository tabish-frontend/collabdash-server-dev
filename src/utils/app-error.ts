import { ResponseStatus } from "./";

export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4")
      ? ResponseStatus.FAIL
      : ResponseStatus.ERROR;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
