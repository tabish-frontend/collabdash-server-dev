// import AppError from "../utils/app-error";
import { AppError, catchAsync, AppResponse, ResponseStatus } from "../utils";
import { UserModel, AttendanceModal } from "../models";

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
        status: "Present", // Default status
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
          attendance.status = "Short Attendance";
        } else if (duration >= 4 && duration < 8) {
          attendance.status = "Half Day";
        } else {
          attendance.status = "Full Day";
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
