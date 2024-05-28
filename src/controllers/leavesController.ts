import { LeavesModal } from "../models";
import { AppError, AppResponse, ResponseStatus, catchAsync } from "../utils";

export const getAllUserLeaves = catchAsync(async (req, res) => {
  // Find all leaves and populate the user information
  const allUserLeaves = await LeavesModal.find().populate(
    "user",
    "full_name username avatar"
  );

  if (!allUserLeaves) {
    throw new AppError("No leaves found", 404);
  }

  return res
    .status(200)
    .json(new AppResponse(200, allUserLeaves, "", ResponseStatus.SUCCESS));
});

export const addLeave = catchAsync(async (req, res) => {
  const { _id } = req.params;

  const user_id = _id || req.body.user;
  const { date, reason, leave_type } = req.body;

  // Check if the leave is already applied for the same date
  const existingLeave = await LeavesModal.findOne({
    user: user_id,
    date,
  });

  if (existingLeave) {
    throw new AppError("Leave has already been applied for this date", 400);
  }

  const newLeave = await LeavesModal.create({
    user: user_id,
    date,
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

export const getUserLeaves = catchAsync(async (req, res) => {
  const { _id } = req.params;

  // Find all leaves for the specified user
  const userLeaves = await LeavesModal.find({ user: _id });

  if (!userLeaves) {
    throw new AppError("No leaves found for the specified user", 404);
  }

  return res
    .status(200)
    .json(new AppResponse(200, userLeaves, "", ResponseStatus.SUCCESS));
});
