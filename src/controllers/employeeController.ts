import {
  APIFeatures,
  AppError,
  AppResponse,
  ExcludedFields,
  ResponseStatus,
  catchAsync,
} from "../utils";
import { AccountStatus, Roles } from "../types";
import { UserModel } from "../models";
import { getAll, getOne, updateOne } from "./handleFactory";

export const getAllEmployees = catchAsync(async (req, res, next) => {
  // To allow for nested GET reviews on tour (hack)
  let filter: any = {};

  if (req.user.role === Roles.HR) {
    filter.role = { $nin: [Roles.HR, Roles.Admin] }; // Exclude HR and Admin
  } else if (req.user.role === Roles.Admin) {
    filter.role = { $ne: Roles.Admin }; // Exclude only Admin
  }

  const total_counts = await UserModel.find();
  const features = new APIFeatures(UserModel.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // const document = await features.query.explain();
  const document = await features.query.select(ExcludedFields);

  return res.status(200).json(
    new AppResponse(
      200,
      {
        users: document,
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
