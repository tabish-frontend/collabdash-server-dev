import { NextFunction, Request, Response } from "express";
import { AnyObjectType } from "../types";
import { AppError, ResponseStatus } from "../utils";

const sendErrorDev = (err: AnyObjectType, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AnyObjectType, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error(`ERROR: ${err}`);

    // 1) Send generic message
    res.status(500).json({
      status: ResponseStatus.ERROR,
      message: "Something went wrong!",
    });
  }
};

const handleCaseErrorDB = (err: AnyObjectType) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: AnyObjectType) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}, Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationFailedDB = (err: AnyObjectType) => {
  const errors = Object.values(err.errors).map(
    (el: AnyObjectType) => el.message
  );
  const message = `Invalid input data: ${errors.join(" ")}`;

  return new AppError(message, 400);
};

export const globalErrorHandler = (
  err: AnyObjectType,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "dev") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "prod") {
    let error = { ...err };

    if (error.name === "CaseError") error = handleCaseErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(err);
    if (error._message === "Validation failed")
      error = handleValidationFailedDB(error);

    sendErrorProd(error, res);
  }
};
