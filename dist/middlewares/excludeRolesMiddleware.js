"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.excludeRolesMiddleware = void 0;
const types_1 = require("../types");
const excludeRolesMiddleware = (req, res, next) => {
    const _a = req.query, { role } = _a, restQuery = __rest(_a, ["role"]);
    req.query = restQuery;
    const userRole = role || req.user.role;
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