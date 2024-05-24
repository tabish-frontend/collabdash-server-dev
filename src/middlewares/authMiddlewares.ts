import { UserModel } from "../models";
import { AppError, catchAsync } from "../utils";
import jwt from "jsonwebtoken";
import { NextFunction } from "express";

export const Protect = catchAsync(async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new AppError(
        "You are not logged in! Please login to get access.",
        401
      );
    }

    const decodedUser: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await UserModel.findById(decodedUser?._id).select(
      "-password -__v -createdAt -updatedAt "
    );

    if (!user) {
      throw new AppError("Invalid Access Token", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    throw new AppError(error?.message || "Invalid access token", 401);
  }
});

export const restrictTo = (...roles: string[]) => {
  return (req: any, res: any, next: () => void) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "You dont have permisssion to perform this action",
        403
      );
    }
    next();
  };
};
