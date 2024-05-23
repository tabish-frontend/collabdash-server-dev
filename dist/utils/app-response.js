"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppResponse = void 0;
class AppResponse {
    constructor(statusCode, data, message = "Success", status) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = status;
    }
}
exports.AppResponse = AppResponse;
//# sourceMappingURL=app-response.js.map