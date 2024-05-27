// import AppError from "../utils/app-error";
import mongoose from "mongoose";
import {
  AppError,
  catchAsync,
  AppResponse,
  ResponseStatus,
  AttendanceStatus,
} from "../utils";
import { UserModel, AttendanceModal } from "../models";
const { ObjectId } = mongoose.Types;

export const manageAttendanceLogs = catchAsync(async (req, res) => {
  try {
    const { notes } = req.body;
    const userId = req.user._id;
    const action = req.params.action; // "clockIn" or "clockOut"
    const currentDate = new Date();
    const startOfDay = new Date(currentDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Validate if user exists
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    // Check if an attendance record for the same user and date already exists
    let attendance = await AttendanceModal.findOne({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!attendance) {
      if (action === "clockOut") {
        throw new AppError("Cannot clock out without clocking in first", 400);
      }

      // Create a new attendance record if none exists and the action is clockIn
      attendance = new AttendanceModal({
        user: userId,
        date: new Date(),
        status: AttendanceStatus.ONLINE, // Default status
        timeIn: new Date(),
        notes,
      });
    } else {
      // Update the existing attendance record based on the action
      if (action === "clockIn") {
        throw new AppError("You are already clocked in today", 400);
      } else if (action === "clockOut") {
        if (attendance.timeOut) {
          throw new AppError("You are already clocked out today", 400);
        }

        // Calculate duration between timeIn and timeOut
        const timeOut: any = new Date();
        const timeIn: any = attendance.timeIn;
        const duration = (timeOut - timeIn) / (1000 * 60 * 60); // Duration in hours

        console.log("duration", duration);
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

    const attendance = await AttendanceModal.findOne({
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

export const getAllUsersAttendance = catchAsync(async (req: any, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res
        .status(400)
        .json({ error: "Month and year are required parameters" });
    }

    const monthNumber = parseInt(month as string, 10);
    const yearNumber = parseInt(year as string, 10);

    // BASIC APPROACH

    // Fetch all users
    // const users = await UserModel.find().select(
    //   "-password  -__v -createdAt -updatedAt "
    // );

    // // Loop through each user
    // const usersWithAttendance = await Promise.all(
    //   users.map(async (user) => {
    //     // Fetch attendance data for the specified month
    //     const attendance = await AttendanceModal.find({
    //       user: user._id,
    //       date: {
    //         $gte: new Date(yearNumber, monthNumber - 1, 1),
    //         $lt: new Date(yearNumber, monthNumber, 0),
    //       },
    //     });

    //     // Return user object with attendance data
    //     return {
    //       user: user.toObject(),
    //       attendance,
    //     };
    //   })
    // );

    // AGGREGATE APPROACH

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

    const attendanceExcludedFields = { createdAt: 0, updatedAt: 0, __v: 0 };

    const usersWithAttendance = await UserModel.aggregate([
      ...req.pipelineModification,
      {
        $lookup: {
          from: "attendances",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$userId"] },
                    {
                      $gte: ["$date", new Date(yearNumber, monthNumber - 1, 1)],
                    },
                    { $lt: ["$date", new Date(yearNumber, monthNumber, 0)] },
                  ],
                },
              },
            },
            {
              $project: attendanceExcludedFields,
            },
          ],
          as: "attendance",
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
    throw new AppError("Error fetching users attendance", 500);
  }
});

// export const getUserAttendance = catchAsync(async (req, res) => {
//   try {
//     const { _id } = req.params;
//     const { month, year } = req.query;

//     if (!month || !year) {
//       return res
//         .status(400)
//         .json({ error: "Month and year are required parameters" });
//     }

//     const monthNumber = parseInt(month as string, 10);
//     const yearNumber = parseInt(year as string, 10);

//     const userExcludedFields = {
//       password: 0,
//       bio: 0,
//       dob: 0,
//       languages: 0,
//       gender: 0,
//       national_identity_number: 0,
//       refresh_token: 0,
//       __v: 0,
//       createdAt: 0,
//       updatedAt: 0,
//     };

//     const attendanceExcludedFields = { createdAt: 0, updatedAt: 0, __v: 0 };

//     const userWithAttendance = await UserModel.aggregate([
//       {
//         $match: { _id: new mongoose.Types.ObjectId(_id) },
//       },
//       {
//         $lookup: {
//           from: "attendances",
//           let: { userId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$user", "$$userId"] },
//                     {
//                       $gte: ["$date", new Date(yearNumber, monthNumber - 1, 1)],
//                     },
//                     { $lt: ["$date", new Date(yearNumber, monthNumber, 1)] },
//                   ],
//                 },
//               },
//             },
//             {
//               $project: attendanceExcludedFields,
//             },
//           ],
//           as: "attendance",
//         },
//       },
//       {
//         $project: userExcludedFields,
//       },
//     ]);

//     if (userWithAttendance.length === 0) {
//       return res
//         .status(404)
//         .json(
//           new AppResponse(404, null, "User not found", ResponseStatus.FAIL)
//         );
//     }

//     return res
//       .status(200)
//       .json(
//         new AppResponse(200, userWithAttendance[0], "", ResponseStatus.SUCCESS)
//       );
//   } catch (error) {
//     throw new AppError("Error fetching user attendance", 500);
//   }
// });

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

    const attendanceRecords = await AttendanceModal.find({
      user: new mongoose.Types.ObjectId(_id),
      date: {
        $gte: new Date(yearNumber, monthNumber - 1, 1),
        $lt: new Date(yearNumber, monthNumber, 1),
      },
    }).select(attendanceExcludedFields);

    if (attendanceRecords.length === 0) {
      return res
        .status(404)
        .json(
          new AppResponse(404, [], "No records found", ResponseStatus.FAIL)
        );
    }

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
