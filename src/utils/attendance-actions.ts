import { Types } from "mongoose";
import { AttendanceModel, UserModel } from "../models";
import { AppError } from "./app-error";
import { AttendanceStatus } from "../utils";

// Define a type for attendance document
import { Attendance, Break } from "../types";

// Helper function to validate user
export const validateUser = async (userId: Types.ObjectId): Promise<void> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
};

// Helper function to find attendance
export const findAttendance = async (
  userId: Types.ObjectId,
  startOfDay: Date,
  endOfDay: Date
): Promise<Attendance | null> => {
  return await AttendanceModel.findOne({
    user: userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });
};

// Helper function to handle clock in
export const handleClockIn = (
  attendance: Attendance | null,
  userId: Types.ObjectId
): Attendance => {
  if (attendance) {
    throw new AppError("You are already clocked in today", 400);
  }
  return new AttendanceModel({
    user: userId,
    date: new Date(),
    status: AttendanceStatus.ONLINE,
    timeIn: new Date(),
  });
};

// Helper function to handle clock out
export const handleClockOut = (attendance: Attendance): Attendance => {
  if (!attendance) {
    throw new AppError("Cannot clock out without clocking in first", 400);
  }
  if (attendance.timeOut) {
    throw new AppError("You are already clocked out today", 400);
  }

  // Check if there is an open break
  const openBreak = attendance.breaks.some((breakItem) => !breakItem.end);

  console.log("openBreak", openBreak);
  if (openBreak) {
    throw new AppError("Cannot clock out while a break is open", 400);
  }

  const timeOut = new Date();
  const timeIn = new Date(attendance.timeIn);

  const totalBreakDurationMs = attendance.breaks.reduce((total, breakItem) => {
    return total + (breakItem.duration || 0);
  }, 0);

  const totalAttendanceDurationMs = timeOut.getTime() - timeIn.getTime();

  const actualWorkingDurationMs =
    totalAttendanceDurationMs - totalBreakDurationMs;
  const actualWorkingDurationHours = actualWorkingDurationMs / (1000 * 60 * 60);

  if (actualWorkingDurationHours < 4) {
    attendance.status = AttendanceStatus.SHORT_ATTENDANCE;
  } else if (
    actualWorkingDurationHours >= 4 &&
    actualWorkingDurationHours < 8
  ) {
    attendance.status = AttendanceStatus.HALF_DAY_PRESENT;
  } else {
    attendance.status = AttendanceStatus.FULL_DAY_PRESENT;
  }

  attendance.duration = actualWorkingDurationMs;
  attendance.timeOut = timeOut;
  return attendance;
};

// Helper function to handle break
export const handleBreak = (attendance: Attendance): Attendance => {
  if (!attendance) {
    throw new AppError("Please Clock In first", 400);
  }
  if (attendance.timeOut) {
    throw new AppError("Cannot break after clocking out", 400);
  }
  const newBreak: Break = {
    start: new Date(),
    end: null,
    duration: 0,
  };
  attendance.breaks.push(newBreak);
  return attendance;
};

// Helper function to handle resume
export const handleResume = (attendance: Attendance): Attendance => {
  if (attendance.timeOut) {
    throw new AppError("Cannot resume break after clocking out", 400);
  }
  const lastBreak = attendance.breaks[attendance.breaks.length - 1];
  if (!lastBreak || lastBreak.end !== null) {
    throw new AppError("No break to resume", 400);
  }

  const endTime = new Date();
  const duration = endTime.getTime() - lastBreak.start.getTime();
  lastBreak.end = endTime;
  lastBreak.duration = duration;
  return attendance;
};
