"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excludeRolesMiddleware = void 0;
const types_1 = require("../types");
const excludeRolesMiddleware = (req, res, next) => {
    const userRole = req.user.role;
    // Modify the query to exclude HR and admin info based on the user's role
    if (userRole === types_1.Roles.HR) {
        req.excludedRoles = [types_1.Roles.HR, types_1.Roles.Admin];
    }
    else if (userRole === types_1.Roles.Admin) {
        req.excludedRoles = [types_1.Roles.Admin];
    }
    else {
        req.excludedRoles = [];
    }
    next();
};
exports.excludeRolesMiddleware = excludeRolesMiddleware;
//# sourceMappingURL=excludeRolesMiddleware.js.map