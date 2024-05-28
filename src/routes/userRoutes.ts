import { Router } from "express";
import {
  addLeave,
  deleteMe,
  getMe,
  getTodayAttendanceOfUser,
  getUserAttendance,
  getUserHolidays,
  getUserLeaves,
  updateMe,
} from "../controllers";
import { Protect, getMyId, uploadUserPhoto } from "../middlewares";

const router = Router();

// PROTECTED ROUTES

router.use(Protect);

router.get("/me", getMyId, getMe);

router.patch("/update-me", uploadUserPhoto, updateMe);

router.delete("/delete-me", deleteMe);

router.get("/myTodayAttendance", getTodayAttendanceOfUser);

router.get("/getMyallAttendance", getMyId, getUserAttendance);

router.get("/getMyAllHolidays", getMyId, getUserHolidays);

router.get("/getMyLeaves", getMyId, getUserLeaves);

router.post("/leaveApply", getMyId, addLeave);

export default router;
