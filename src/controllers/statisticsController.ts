import { AccountStatus, Roles } from "../types";
import { AttendanceModel, LeavesModel, UserModel } from "../models";
import {
  AppError,
  AppResponse,
  LeavesStatus,
  ResponseStatus,
  catchAsync,
  getDatesInMonth,
} from "../utils";

export const getAllUserAttendanceStatistics = catchAsync(
  async (req: any, res) => {
    const { month, year } = req.query;

    const monthNumber = parseInt(month as string, 10);
    const yearNumber = parseInt(year as string, 10);

    const startDate = new Date(yearNumber, monthNumber - 1, 1);
    const endDate = new Date(yearNumber, monthNumber, 0);

    try {
      const totalEmployees = await UserModel.countDocuments({
        account_status: AccountStatus.Active,
        role: { $nin: req.excludedRoles },
      });

      const employeeIds = await UserModel.find({
        account_status: AccountStatus.Active,
        role: { $nin: req.excludedRoles },
      }).distinct("_id");

      // Fetch attendance data for the month, excluding specific roles
      const attendanceData = await AttendanceModel.find({
        date: {
          $gte: startDate,
          $lt: endDate,
        },
        user: { $in: employeeIds },
      });

      // Create a map for attendance data
      const attendanceMap: any = {};
      attendanceData.forEach((record) => {
        const dateStr = new Date(record.date)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })
          .replace(/ /g, " ");
        if (!attendanceMap[dateStr]) {
          attendanceMap[dateStr] = { present: 0, absent: 0 };
        }

        attendanceMap[dateStr].present++;
      });

      const datesInMonth = getDatesInMonth(monthNumber, year);
      const responseData: any = {};

      datesInMonth.forEach((date) => {
        const attendance = attendanceMap[date] || {
          present: 0,
          absent: totalEmployees,
        };
        if (!attendanceMap[date]) {
          attendance.absent = totalEmployees;
        } else {
          attendance.absent = totalEmployees - attendance.present;
        }

        responseData[date] = attendance;
      });

      return res
        .status(200)
        .json(new AppResponse(200, responseData, "", ResponseStatus.SUCCESS));
    } catch (error) {
      throw new AppError("Error Fetching Attendance Statistics", 500);
    }
  }
);

export const allUserTodayAttendanceStatus = catchAsync(
  async (req: any, res) => {
    const currentDate = new Date();
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

    const totalEmployees = await UserModel.countDocuments({
      account_status: AccountStatus.Active,
      role: { $nin: req.excludedRoles },
    });

    console.log("totalEmployees", totalEmployees);

    const employeeIds = await UserModel.find({
      account_status: AccountStatus.Active,
      role: { $nin: req.excludedRoles },
    }).distinct("_id");

    const leaveUsers = await LeavesModel.find({
      user: employeeIds,
      status: LeavesStatus.Approved,
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    });

    console.log("leaveUsers", leaveUsers);

    console.log("startOfDay", startOfDay);

    const attendanceData = await AttendanceModel.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    console.log("attendanceData", attendanceData);

    return res
      .status(200)
      .json(new AppResponse(200, {}, "", ResponseStatus.SUCCESS));
  }
);
