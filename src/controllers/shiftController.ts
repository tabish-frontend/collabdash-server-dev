import { Types } from "mongoose";
import { ShiftModel, UserModel } from "../models";
import { AppError, AppResponse, ResponseStatus, catchAsync } from "../utils";

export const addShift = catchAsync(async (req, res) => {
  const { times, weekends, user } = req.body;

  // Validate user existence
  const employee = await UserModel.findById(user);
  if (!employee) {
    throw new AppError("User not found", 404);
  }

  if (employee.shift) {
    throw new AppError("User already has a shift assigned", 400);
  }

  // Create new shift
  const newShift = await ShiftModel.create({
    user: new Types.ObjectId(user),
    times,
    weekends,
  });

  // Update user with shiftId
  employee.shift = newShift._id;
  await employee.save();

  return res
    .status(201)
    .json(
      new AppResponse(201, newShift, "Shift Added", ResponseStatus.SUCCESS)
    );
});

export const updateShift = catchAsync(async (req, res) => {
  const { shift_id } = req.params;
  const { times, weekends } = req.body;

  // Validate shift existence
  const shift = await ShiftModel.findById(shift_id);
  if (!shift) {
    throw new AppError("Shift not found", 404);
  }

  // Update the shift details
  shift.times = times || shift.times;
  shift.weekends = weekends || shift.weekends;

  // Save the updated shift
  const updatedShift = await shift.save();

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        updatedShift,
        "Shift Updated",
        ResponseStatus.SUCCESS
      )
    );
});
