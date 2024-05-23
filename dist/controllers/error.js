"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const utils_1 = require("../utils");
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        // Programming or other unknown error: don't leak error details
    }
    else {
        // 1) Log error
        console.error(`ERROR: ${err}`);
        // 1) Send generic message
        res.status(500).json({
            status: utils_1.ResponseStatus.ERROR,
            message: "Something went wrong!",
        });
    }
};
const handleCaseErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new utils_1.AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
    const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value: ${value}, Please use another value!`;
    return new utils_1.AppError(message, 400);
};
const handleValidationFailedDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data: ${errors.join(" ")}`;
    return new utils_1.AppError(message, 400);
};
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "dev") {
        sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV === "prod") {
        let error = Object.assign({}, err);
        if (error.name === "CaseError")
            error = handleCaseErrorDB(error);
        if (error.code === 11000)
            error = handleDuplicateFieldsDB(err);
        if (error._message === "Validation failed")
            error = handleValidationFailedDB(error);
        sendErrorProd(error, res);
    }
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=error.js.map