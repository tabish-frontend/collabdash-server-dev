import { AppError, AppResponse, ResponseStatus, catchAsync } from "../utils";
import { AccountStatus } from "../types";
import { UserModel } from "../models";
import { getAll, getOne, updateOne } from "./handleFactory";

export const getAllEmployees = getAll(
  UserModel,
  "employee",
  "-password -__v -createdAt -updatedAt "
);

export const getEmployee = getOne(
  UserModel,
  "-password -__v -createdAt -updatedAt"
);

export const updateEmployee = updateOne(
  UserModel,
  "-password -__v -createdAt -updatedAt "
);

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
