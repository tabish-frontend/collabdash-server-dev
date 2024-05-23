"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const _1 = require("./");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4")
            ? _1.ResponseStatus.FAIL
            : _1.ResponseStatus.ERROR;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=app-error.js.map