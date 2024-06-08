import { Router } from "express";
import {
  allUserTodayAttendanceStatistics,
  getAllUserAttendanceStatistics,
  getAllUserStatistics,
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
  allUserTodayAttendanceStatistics
);

router.get("/calculateUsers", excludeRolesMiddleware, getAllUserStatistics);

export default router;
