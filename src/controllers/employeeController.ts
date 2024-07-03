import {
  APIFeatures,
  AppError,
  AppResponse,
  ExcludedFields,
  ResponseStatus,
  catchAsync,
} from "../utils";
import { AccountStatus, Roles } from "../types";
import {
  AttendanceModel,
  HolidayModel,
  LeavesModel,
  UserModel,
} from "../models";
import { getAll, getOne, updateOne } from "./handleFactory";

const getDayOfWeek = (date: Date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
};

const checkTodayStatus = async (user: any) => {
  const today = new Date();
  const dayOfWeek = getDayOfWeek(today);

  // Check if today is a holiday
  const holiday = await HolidayModel.findOne({
    date: {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lt: new Date(today.setHours(23, 59, 59, 999)),
    },
    users: user._id,
  });

  if (holiday) {
    return "Holiday";
  }

  // Check if today is a leave day
  const leave = await LeavesModel.findOne({
    user: user._id,
    startDate: { $lte: today },
    endDate: { $gte: today },
    status: "Approved",
  });

  if (leave) {
    return "On Leave";
  }

  // Check if today is a weekend
  if (user.shift && user.shift.weekends.includes(dayOfWeek)) {
    return "Weekend";
  }

  const attendance = await AttendanceModel.findOne({
    user: user._id,
    date: {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lt: new Date(today.setHours(23, 59, 59, 999)),
    },
  });

  if (attendance) {
    if (attendance.timeIn && !attendance.timeOut) {
      return "Online";
    } else if (attendance.timeIn && attendance.timeOut) {
      const timeOut: any = new Date(attendance.timeOut);
      const timeIn: any = new Date(attendance.timeIn);
      const duration = (timeOut - timeIn) / (1000 * 60 * 60);

      if (duration < 4) {
        return "Short Attendance";
      } else if (duration >= 4 && duration < 8) {
        return "Half Day Present";
      } else {
        return "Full Day Present";
      }
    }
  }

  return "Offline";
};

export const getAllEmployees = catchAsync(async (req: any, res, next) => {
  let filter: any = { role: { $nin: req.excludedRoles } };

  const total_counts = await UserModel.find();
  const features = new APIFeatures(UserModel.find(filter), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const document = await features.query.select(ExcludedFields);

  const populatedDocuments: any = await UserModel.populate(document, {
    path: "shift",
  });

  // Add Today_Status to each user
  const usersWithStatus = await Promise.all(
    populatedDocuments.map(async (user: { _doc: any }) => {
      const todayStatus = await checkTodayStatus(user);
      return { ...user._doc, Today_Status: todayStatus };
    })
  );

  const usersWithoutShift = usersWithStatus.map((user) => {
    const { shift, ...rest } = user;
    return rest;
  });

  return res.status(200).json(
    new AppResponse(
      200,
      {
        users: usersWithoutShift,
        result: document.length,
        total_counts: total_counts.length,
      },
      "",
      ResponseStatus.SUCCESS
    )
  );
});

export const getEmployee = getOne(UserModel, ExcludedFields);

export const updateEmployee = updateOne(UserModel, ExcludedFields);

export const deleteEmployee = catchAsync(async (req, res) => {
  const { username } = req.params;
  const document = await UserModel.findOneAndUpdate(
    { username: username },
    {
      account_status: AccountStatus.Deleted,
    }
  );

  if (!document) {
    throw new AppError("No document found with that ID", 404);
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        {},
        "User deleted  Successfully",
        ResponseStatus.SUCCESS
      )
    );
});
