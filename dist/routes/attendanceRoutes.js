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
exports.default = router;
//# sourceMappingURL=attendanceRoutes.js.map