import { Router } from "express";
import {
  getAllUsersAttendance,
  getUserAttendance,
  manageAttendanceLogs,
} from "../controllers";
import {
  Protect,
  filterAttendanceByRole,
  getMyId,
  restrictTo,
} from "../middlewares";

const router = Router();

// PROTECTED ROUTES

router.use(Protect);

router.post("/:action", manageAttendanceLogs);

// RESTRICTED ROUTES

router.use(restrictTo("hr", "admin"));

router.get("/:_id", getUserAttendance);

router.get("/", filterAttendanceByRole, getAllUsersAttendance);

export default router;
