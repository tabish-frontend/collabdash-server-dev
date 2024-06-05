import { Router } from "express";
import {
  allUserTodayAttendanceStatus,
  getAllUserAttendanceStatistics,
} from "../controllers";
import { Protect, excludeRolesMiddleware, restrictTo } from "../middlewares";

const router = Router();

// PROTECTED ROUTES

router.use(Protect);

// RESTRICTED ROUTES

router.use(restrictTo("hr", "admin"));

router.get(
  "/employeesMonthlyAttendance",
  excludeRolesMiddleware,
  getAllUserAttendanceStatistics
);

router.get(
  "/todayAttendanceStatus",
  excludeRolesMiddleware,
  allUserTodayAttendanceStatus
);

export default router;
