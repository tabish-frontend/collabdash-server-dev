import { Router } from "express";
import { getTodayAttendanceOfUser, manageAttendanceLogs } from "../controllers";
import { Protect } from "../middlewares";

const router = Router();

// PROTECTED ROUTES

router.use(Protect);

router.post("/:action", manageAttendanceLogs);

router.get("/myTodayAttendance", getTodayAttendanceOfUser);

export default router;
