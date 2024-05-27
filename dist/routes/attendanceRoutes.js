"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
// PROTECTED ROUTES
router.use(middlewares_1.Protect);
router.post("/:action", controllers_1.manageAttendanceLogs);
router.get("/myTodayAttendance", controllers_1.getTodayAttendanceOfUser);
// RESTRICTED ROUTES
router.use((0, middlewares_1.restrictTo)("hr", "admin"));
router.get("/:_id", controllers_1.getUserAttendance);
router.get("/", middlewares_1.filterAttendanceByRole, controllers_1.getAllUsersAttendance);
exports.default = router;
//# sourceMappingURL=attendanceRoutes.js.map