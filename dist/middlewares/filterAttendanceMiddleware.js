"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterAttendanceByRole = void 0;
const filterAttendanceByRole = (req, res, next) => {
    const { role } = req.user;
    // Define the pipeline modification based on roles
    let pipelineModification = [];
    if (role === "admin") {
        pipelineModification = [
            { $match: { role: { $ne: "admin" }, account_status: "active" } }, // Exclude admin users, include only active accounts
        ];
    }
    else if (role === "hr") {
        pipelineModification = [
            { $match: { role: { $nin: ["hr", "admin"] }, account_status: "active" } }, // Exclude hr and admin users, include only active accounts
        ];
    }
    else {
        pipelineModification = [
            { $match: { account_status: "active" } }, // For other roles, include only active accounts
        ];
    }
    // Apply the pipeline modification to the aggregation pipeline
    req.pipelineModification = pipelineModification;
    next();
};
exports.filterAttendanceByRole = filterAttendanceByRole;
//# sourceMappingURL=filterAttendanceMiddleware.js.map