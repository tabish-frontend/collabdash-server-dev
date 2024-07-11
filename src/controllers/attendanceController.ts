// import AppError from "../utils/app-error";
import mongoose from "mongoose";
import {
  AppError,
  catchAsync,
  AppResponse,
  ResponseStatus,
  validateUser,
  findAttendance,
  handleClockIn,
  handleClockOut,
  handleBreak,
  handleResume,
  AttendanceStatus,
} from "../utils";
import { UserModel, AttendanceModel, ShiftModel } from "../models";
import {
  lookupAttendance,
  lookupHolidays,
  lookupLeaves,
  lookupShift,
} from "../lookups";

export const manageAttendanceLogs = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const action = req.params.action;

    const currentDate = new Date();
    const currentDay = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const startDateUTC = new Date(currentDate.setUTCHours(0, 0, 0, 0));
    const endDateUTC = new Date(currentDate.setUTCHours(23, 59, 59, 999));

    await validateUser(userId);
    let attendance = await findAttendance(userId, startDateUTC, endDateUTC);

    const shift = await ShiftModel.findOne({ user: userId });

    let shiftDuration = 9;
    if (shift) {
      if (shift.shift_type === "Fixed") {
        const shiftTime = shift.times.find((time) =>
          time.days.includes(currentDay)
        );
        if (shiftTime) {
          const start = new Date(shiftTime.start).getTime();
          const end = new Date(shiftTime.end).getTime();
          shiftDuration = (end - start) / (1000 * 60 * 60);
        }
      } else if (shift.shift_type === "Flexible") {
        shiftDuration = shift.hours;
      }
    }

    switch (action) {
      case "clockIn":
        attendance = handleClockIn(attendance, userId);
        break;
      case "clockOut":
        attendance = handleClockOut(attendance, shiftDuration);
        break;
      case "break":
        attendance = handleBreak(attendance);
        break;
      case "resume":
        attendance = handleResume(attendance);
        break;
      default:
        throw new AppError("Invalid action", 401);
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
    throw new AppError(error?.message || "Something went wrong", 404);
  }
});

export const getAllUsersAttendance = catchAsync(
  async (req: any, res: any, next: any) => {
    try {
      const { month, year, view, date } = req.query;

      if (!month || !year || !view) {
        return res
          .status(400)
          .json({ error: "Month, year, and view are required parameters" });
      }

      const specificDate = date ? new Date(date as string) : null;

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
        lookupAttendance(year, month, view as string, specificDate),
        lookupHolidays(year, month, view as string, specificDate),
        lookupLeaves(year, month, view as string, specificDate),
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
  }
);

export const getUserAttendance = catchAsync(async (req, res) => {
  try {
    const { _id } = req.params;
    const { month, year, view, date } = req.query;

    if (!month || !year || !view) {
      return res
        .status(400)
        .json({ error: "Month, year, and view are required parameters" });
    }

    const monthNumber = parseInt(month as string, 10);
    const yearNumber = parseInt(year as string, 10);
    const specificDate = date ? new Date(date as string) : null;

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

    const userWithAttendance = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id),
        },
      },
      lookupAttendance(yearNumber, monthNumber, view as string, specificDate),
      lookupHolidays(yearNumber, monthNumber, view as string, specificDate),
      lookupLeaves(yearNumber, monthNumber, view as string, specificDate),
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

    if (!userWithAttendance.length) {
      return res
        .status(404)
        .json({ error: "User not found or no attendance records available" });
    }

    return res
      .status(200)
      .json(
        new AppResponse(
          200,
          { data: userWithAttendance[0] },
          "",
          ResponseStatus.SUCCESS
        )
      );
  } catch (error) {
    throw new AppError("Error fetching user attendance", 500);
  }
});

export const updateAttendance = catchAsync(async (req, res) => {
  const { attendanceId } = req.params;
  const { timeIn, timeOut } = req.body;

  if (!attendanceId) {
    throw new AppError("Attendance ID is required'", 400);
  }

  if (!timeIn) {
    throw new AppError("TimeIn value is required", 400);
  }

  let status;
  let duration = 0;

  if (timeIn && timeOut) {
    duration = new Date(timeOut).getTime() - new Date(timeIn).getTime();

    const DurationHours = duration / (1000 * 60 * 60);

    if (DurationHours < 4) {
      status = AttendanceStatus.SHORT_ATTENDANCE;
    } else if (DurationHours >= 4 && DurationHours < 8) {
      status = AttendanceStatus.HALF_DAY_PRESENT;
    } else {
      status = AttendanceStatus.FULL_DAY_PRESENT;
    }
  } else {
    status = AttendanceStatus.ONLINE;
  }

  const updatedAttendance = await AttendanceModel.findByIdAndUpdate(
    attendanceId,
    {
      timeIn: new Date(timeIn),
      timeOut: timeOut ? new Date(timeOut) : null,
      status,
      duration,
    }
  );

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        updatedAttendance,
        "Attendance updated successfully",
        ResponseStatus.SUCCESS
      )
    );
});
