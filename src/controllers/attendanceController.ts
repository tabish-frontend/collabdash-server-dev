// import AppError from "../utils/app-error";
import mongoose from "mongoose";
import {
  AppError,
  catchAsync,
  AppResponse,
  ResponseStatus,
  AttendanceStatus,
  LeavesStatus,
  checkHoliday,
  checkLeave,
  checkShift,
} from "../utils";
import {
  UserModel,
  AttendanceModel,
  HolidayModel,
  LeavesModel,
  ShiftModel,
} from "../models";
import {
  lookupAttendance,
  lookupHolidays,
  lookupLeaves,
  lookupShift,
} from "../lookups";

export const manageAttendanceLogs = catchAsync(async (req, res) => {
  try {
    const { notes } = req.body;
    const userId = req.user._id;
    const action = req.params.action;
    const currentDate = new Date();
    const currentDay = currentDate.toLocaleString("en-US", { weekday: "long" });
    const currentTime = currentDate.getTime();
    const startOfDay = new Date(
      Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 1,
        0,
        0,
        0,
        0
      )
    );

    const endOfDay = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate() - 1,
        23,
        59,
        59,
        999
      )
    );

    // Validate if user exists
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    // Check if an attendance record for the same user and date already exists
    let attendance = await AttendanceModel.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!attendance) {
      if (action === "clockOut") {
        throw new AppError("Cannot clock out without clocking in first", 400);
      }

      attendance = new AttendanceModel({
        user: userId,
        date: new Date(),
        status: AttendanceStatus.ONLINE,
        timeIn: new Date(),
        notes,
      });
    } else {
      if (action === "clockIn") {
        throw new AppError("You are already clocked in today", 400);
      } else if (action === "clockOut") {
        if (attendance.timeOut) {
          throw new AppError("You are already clocked out today", 400);
        }

        const timeOut: any = new Date();
        const timeIn: any = attendance.timeIn;
        const duration = (timeOut - timeIn) / (1000 * 60 * 60);

        if (duration < 4) {
          attendance.status = AttendanceStatus.SHORT_ATTENDANCE;
        } else if (duration >= 4 && duration < 8) {
          attendance.status = AttendanceStatus.HALF_DAY_PRESENT;
        } else {
          attendance.status = AttendanceStatus.FULL_DAY_PRESENT;
        }

        attendance.duration = duration;
        attendance.timeOut = timeOut;
      }
    }

    await attendance.save();
    res
      .status(200)
      .json(
        new AppResponse(
          200,
          { attendance },
          `${action} Successfully`,
          ResponseStatus.SUCCESS
        )
      );
  } catch (error) {
    throw new AppError(error?.message || "Something went wrong", 401);
  }
});

export const getTodayAttendanceOfUser = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const currentDate = new Date();
    const startOfDay = new Date(currentDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const attendance = await AttendanceModel.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!attendance) {
      throw new AppError("Attendance not found for today", 404);
    }

    return res
      .status(200)
      .json(new AppResponse(200, { attendance }, "", ResponseStatus.SUCCESS));
  } catch (error) {
    throw new AppError(error?.message || "Something went wrong", 401);
  }
});

export const getAllUsersAttendance = catchAsync(async (req: any, res, next) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res
        .status(400)
        .json({ error: "Month and year are required parameters" });
    }

    const monthNumber = parseInt(month as string, 10);
    const yearNumber = parseInt(year as string, 10);

    const userExcludedFields = {
      password: 0,
      bio: 0,
      dob: 0,
      languages: 0,
      gender: 0,
      national_identity_number: 0,
      refresh_token: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    };

    const usersWithAttendance = await UserModel.aggregate([
      ...req.pipelineModification,
      lookupAttendance(yearNumber, monthNumber),
      lookupHolidays(yearNumber, monthNumber),
      lookupLeaves(yearNumber, monthNumber),
      lookupShift(),
      {
        $unwind: {
          path: "$shift",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: userExcludedFields,
      },
    ]);

    return res
      .status(200)
      .json(
        new AppResponse(200, usersWithAttendance, "", ResponseStatus.SUCCESS)
      );
  } catch (error) {
    return next(new AppError("Error fetching users attendance", 500));
  }
});

export const getUserAttendance = catchAsync(async (req, res) => {
  try {
    const { _id } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res
        .status(400)
        .json({ error: "Month and year are required parameters" });
    }

    const monthNumber = parseInt(month as string, 10);
    const yearNumber = parseInt(year as string, 10);

    const attendanceExcludedFields = { createdAt: 0, updatedAt: 0, __v: 0 };

    const attendanceRecords = await AttendanceModel.find({
      user: new mongoose.Types.ObjectId(_id),
      date: {
        $gte: new Date(yearNumber, monthNumber - 1, 1),
        $lt: new Date(yearNumber, monthNumber, 1),
      },
    }).select(attendanceExcludedFields);

    return res.status(200).json(
      new AppResponse(
        200,
        {
          attendance: attendanceRecords,
        },
        "",
        ResponseStatus.SUCCESS
      )
    );
  } catch (error) {
    throw new AppError("Error fetching user attendance", 500);
  }
});
