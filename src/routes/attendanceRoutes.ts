import { Router } from "express";
import {
  getAllUsersAttendance,
  getTodayAttendanceOfUser,
  manageAttendanceLogs,
} from "../controllers";
import { Protect, filterAttendanceByRole, restrictTo } from "../middlewares";

const router = Router();

// PROTECTED ROUTES

router.use(Protect);

router.post("/:action", manageAttendanceLogs);

router.get("/myTodayAttendance", getTodayAttendanceOfUser);

// RESTRICTED ROUTES

router.use(restrictTo("hr", "admin"));

router.get("/", filterAttendanceByRole, getAllUsersAttendance);

export default router;
