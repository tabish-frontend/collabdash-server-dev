import { AccountStatus, Roles } from "../types";
import { AttendanceModel, LeavesModel, ShiftModel, UserModel } from "../models";
import {
  AppError,
  AppResponse,
  LeavesStatus,
  ResponseStatus,
  catchAsync,
  formatTime,
  getDatesInMonth,
} from "../utils";

export const getAllUserStatistics = catchAsync(async (req: any, res) => {
  // Count male users excluding HR and Admin
  const maleUsers = await UserModel.countDocuments({
    account_status: "active",
    gender: "male",
    role: { $nin: req.excludedRoles },
  });

  // Count female users excluding HR and Admin
  const femaleUsers = await UserModel.countDocuments({
    account_status: "active",
    gender: "female",
    role: { $nin: req.excludedRoles },
  });

  return res.status(200).json(
    new AppResponse(
      200,
      {
        man: maleUsers,
        women: femaleUsers,
      },
      "",
      ResponseStatus.SUCCESS
    )
  );
});

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

// export const allUserTodayAttendanceStatistics = catchAsync(
//   async (req: any, res) => {
//     const currentDate = new Date();

//     const startOfDay = new Date(currentDate.setUTCHours(0, 0, 0, 0));
//     const endOfDay = new Date(currentDate.setUTCHours(23, 59, 59, 999));

//     const totalEmployees = await UserModel.countDocuments({
//       account_status: AccountStatus.Active,
//       role: { $nin: req.excludedRoles },
//     });

//     const employeeIds = await UserModel.find({
//       account_status: AccountStatus.Active,
//       role: { $nin: req.excludedRoles },
//     }).distinct("_id");

//     const leaveUsers = await LeavesModel.countDocuments({
//       user: employeeIds,
//       status: LeavesStatus.Approved,
//       startDate: { $lte: endOfDay },
//       endDate: { $gte: startOfDay },
//     });

//     const attendanceRecords = await AttendanceModel.find({
//       user: { $in: employeeIds },
//       date: { $gte: startOfDay, $lt: endOfDay },
//     });

//     let presentUsers = 0;
//     let lateUsers = 0;

//     const shiftRecords = await ShiftModel.find({
//       user: { $in: employeeIds },
//       shift_type: "Fixed",
//     });

//     const shiftMap = new Map();
//     shiftRecords.forEach((shift) => {
//       shiftMap.set(shift.user.toString(), shift);
//     });

//     attendanceRecords.forEach((attendance) => {
//       const userShift = shiftMap.get(attendance.user.toString());
//       if (userShift) {
//         const userShiftTime = userShift.times.find(
//           (time: { days: string | string[] }) =>
//             time.days.includes(
//               currentDate.toLocaleDateString("en-US", { weekday: "long" })
//             )
//         );

//         if (userShiftTime) {
//           const shiftWithGracePeriod = new Date(
//             userShiftTime.start.getTime() + 20 * 60000
//           );

//           const shiftStartTime = formatTime(new Date(shiftWithGracePeriod));
//           const attendanceTimeIn = formatTime(new Date(attendance.timeIn));

//           if (attendanceTimeIn > shiftStartTime) {
//             lateUsers++;
//           }
//         }
//       }
//       presentUsers++;
//     });

//     return res.status(200).json(
//       new AppResponse(
//         200,
//         {
//           present: presentUsers,
//           leave: leaveUsers,
//           absent: totalEmployees - presentUsers - leaveUsers,
//           on_late: lateUsers,
//         },
//         "",
//         ResponseStatus.SUCCESS
//       )
//     );
//   }
// );

export const allUserTodayAttendanceStatistics = catchAsync(
  async (req: any, res) => {
    const currentDate = new Date();

    const startOfDay = new Date(currentDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setUTCHours(23, 59, 59, 999));

    const totalEmployees = await UserModel.find({
      account_status: AccountStatus.Active,
      role: { $nin: req.excludedRoles },
    }).select("_id username full_name avatar");

    const totalEmployeeIds = totalEmployees.map((user) => user._id);

    const leaveUsers = await LeavesModel.find({
      user: { $in: totalEmployeeIds },
      status: LeavesStatus.Approved,
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    }).populate("user", "username full_name avatar");

    const leaveUserIds = leaveUsers.map((leave) => leave.user._id);

    const attendanceRecords = await AttendanceModel.find({
      user: { $in: totalEmployeeIds },
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    const shiftRecords = await ShiftModel.find({
      user: { $in: totalEmployeeIds },
      shift_type: "Fixed",
    });

    const shiftMap = new Map();
    shiftRecords.forEach((shift) => {
      shiftMap.set(shift.user.toString(), shift);
    });

    let presentUserIds: string[] = [];
    let lateUserIds: string[] = [];

    attendanceRecords.forEach((attendance) => {
      const userShift = shiftMap.get(attendance.user.toString());
      if (userShift) {
        const userShiftTime = userShift.times.find(
          (time: { days: string | string[] }) =>
            time.days.includes(
              currentDate.toLocaleDateString("en-US", { weekday: "long" })
            )
        );

        if (userShiftTime) {
          const shiftWithGracePeriod = new Date(
            new Date(userShiftTime.start).getTime() + 20 * 60000
          );
          const shiftStartTime = formatTime(new Date(shiftWithGracePeriod));
          const attendanceTimeIn = formatTime(new Date(attendance.timeIn));

          if (attendanceTimeIn > shiftStartTime) {
            lateUserIds.push(attendance.user.toString());
          }
        }
      }
      presentUserIds.push(attendance.user.toString());
    });

    const lateUserDetails = totalEmployees.filter((user) =>
      lateUserIds.includes(user._id.toString())
    );
    const presentUserDetails = totalEmployees.filter((user) =>
      presentUserIds.includes(user._id.toString())
    );
    const absentUserDetails = totalEmployees.filter(
      (user) =>
        !presentUserIds.includes(user._id.toString()) &&
        !leaveUserIds.includes(user._id)
    );

    return res.status(200).json(
      new AppResponse(
        200,
        {
          present: presentUserDetails.map((user) => ({
            _id: user._id,
            username: user.username,
            full_name: user.full_name,
            avatar: user.avatar,
          })),
          leave: leaveUsers.map((leave: any) => ({
            _id: leave.user._id,
            username: leave.user.username,
            full_name: leave.user.full_name,
            avatar: leave.user.avatar,
          })),
          absent: absentUserDetails.map((user) => ({
            _id: user._id,
            username: user.username,
            full_name: user.full_name,
            avatar: user.avatar,
          })),
          on_late: lateUserDetails.map((user) => ({
            _id: user._id,
            username: user.username,
            full_name: user.full_name,
            avatar: user.avatar,
          })),
        },
        "",
        ResponseStatus.SUCCESS
      )
    );
  }
);
