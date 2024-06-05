"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
// PROTECTED ROUTES
router.use(middlewares_1.Protect);
// RESTRICTED ROUTES
router.use((0, middlewares_1.restrictTo)("hr", "admin"));
router.get("/employeesMonthlyAttendance", middlewares_1.excludeRolesMiddleware, controllers_1.getAllUserAttendanceStatistics);
router.get("/todayAttendanceStatus", middlewares_1.excludeRolesMiddleware, controllers_1.allUserTodayAttendanceStatus);
exports.default = router;
//# sourceMappingURL=statisticsRoutes.js.map