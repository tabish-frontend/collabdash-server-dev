import { LeavesModel } from "../models";
import {
  AppError,
  AppResponse,
  LeavesStatus,
  ResponseStatus,
  catchAsync,
} from "../utils";

export const getAllUserLeaves = catchAsync(async (req, res) => {
  const { month, year } = req.query;

  const monthNumber = parseInt(month as string, 10);
  const yearNumber = parseInt(year as string, 10);

  const startDate = new Date(yearNumber, monthNumber - 1, 1);
  const endDate = new Date(yearNumber, monthNumber, 0);

  // Find leaves within the date range and populate user references
  const leaves = await LeavesModel.find({
    startDate: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate("user", "full_name username avatar")
    .sort({ startDate: 1 });

  if (!leaves) {
    throw new AppError("No Leaves found", 409);
  }

  return res
    .status(200)
    .json(new AppResponse(200, leaves, "", ResponseStatus.SUCCESS));
});

export const getUserLeaves = catchAsync(async (req, res) => {
  const { _id } = req.params;

  const { month, year } = req.query;

  const monthNumber = parseInt(month as string, 10);
  const yearNumber = parseInt(year as string, 10);

  const startDate = new Date(yearNumber, monthNumber - 1, 1);
  const endDate = new Date(yearNumber, monthNumber, 0);

  // Find all holidays for the specified user
  const userLeaves = await LeavesModel.find({
    user: _id,
    startDate: {
      $gte: startDate,
      $lte: endDate,
    },
  }).select("-users");

  return res
    .status(200)
    .json(new AppResponse(200, userLeaves, "", ResponseStatus.SUCCESS));
});

export const addLeave = catchAsync(async (req, res) => {
  const { _id } = req.params;

  const user_id = _id || req.body.user;

  const { startDate, endDate, reason, leave_type } = req.body;

  // Check if there is an overlapping leave for the user
  const overlappingLeave = await LeavesModel.findOne({
    user: user_id,
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
    ],
  });

  if (overlappingLeave) {
    throw new AppError("Leave already applied for overlapping dates", 400);
  }

  const newLeave = await LeavesModel.create({
    user: user_id,
    startDate,
    endDate,
    reason,
    leave_type,
  });

  return res
    .status(201)
    .json(
      new AppResponse(
        201,
        newLeave,
        "Leave Added Successfully",
        ResponseStatus.SUCCESS
      )
    );
});

export const updateLeave = catchAsync(async (req, res) => {
  const { leave_id } = req.params;
  const { startDate, endDate } = req.body;

  // Find the leave to update
  const leaveToUpdate = await LeavesModel.findById(leave_id);
  if (!leaveToUpdate) {
    throw new AppError("No leave found with that ID", 404);
  }

  // Check if there is an overlapping leave for the user
  const overlappingLeave = await LeavesModel.findOne({
    user: leaveToUpdate.user,
    _id: { $ne: leave_id }, // Exclude the current leave from the check
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
    ],
  });

  if (overlappingLeave) {
    throw new AppError("Leave already exists for overlapping dates", 400);
  }

  const updatedLeave = await LeavesModel.findByIdAndUpdate(leave_id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedLeave) {
    throw new AppError("No Leave found with that ID", 400);
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        updatedLeave,
        "Leave Updated",
        ResponseStatus.SUCCESS
      )
    );
});

export const deleteLeave = catchAsync(async (req, res) => {
  const { leave_id } = req.params;

  const holiday = await LeavesModel.findByIdAndDelete(leave_id);

  if (!holiday) {
    throw new AppError("No Leave found with that ID", 400);
  }

  return res
    .status(200)
    .json(new AppResponse(200, null, "Leave Deleted", ResponseStatus.SUCCESS));
});

export const updateLeaveStatus = catchAsync(async (req, res) => {
  const { leave_id, status } = req.params;

  // Validate the status
  if (!Object.values(LeavesStatus).includes(status)) {
    throw new AppError("Invalid leave status", 400);
  }

  // Find the leave and update its status
  const leaveToUpdate = await LeavesModel.findByIdAndUpdate(
    leave_id,
    { status },
    { new: true, runValidators: true }
  );

  if (!leaveToUpdate) {
    throw new AppError("No leave found with that ID", 404);
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        leaveToUpdate,
        `Leave ${status}`,
        ResponseStatus.SUCCESS
      )
    );
});
