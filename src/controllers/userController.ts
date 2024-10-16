import { UserModel } from "../models";
import { getOne } from "./handleFactory";
import { AccountStatus } from "../types";
import {
  AppError,
  AppResponse,
  ExcludedFields,
  ResponseStatus,
  catchAsync,
  isFilesObject,
  uploadOnCloudinary,
} from "../utils";

export const getMe = getOne(UserModel, ExcludedFields);

export const updateMe = catchAsync(async (req, res) => {
  // 1) Create error if user Post password data in this route
  if (req.body.password || req.body.confirm_password) {
    throw new AppError(
      "This route is not for password updates, Please use /updateMyPassword route.",
      400
    );
  }

  if (isFilesObject(req.files)) {
    const avatar = await uploadOnCloudinary(req.files.attachment[0]);
    req.body.avatar = avatar.url;
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user._id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  ).select(ExcludedFields);

  return res
    .status(201)
    .json(
      new AppResponse(
        200,
        updatedUser,
        "Information Updated",
        ResponseStatus.SUCCESS
      )
    );
});

export const deleteMe = catchAsync(async (req, res) => {
  await UserModel.findByIdAndUpdate(req.user._id, {
    account_status: AccountStatus.Deleted,
  });

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        null,
        "User Deleted succefully",
        ResponseStatus.SUCCESS
      )
    );
});
