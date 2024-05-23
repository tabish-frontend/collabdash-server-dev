import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { AccountStatus, AnyObjectType, TUser } from "../types";
import {
  AppError,
  TUITION_HIGHWAY,
  catchAsync,
  ResponseStatus,
  get_email_template_for_temporary_password,
  AppResponse,
} from "../utils";
import { send_email } from "../config/email";
import { Types } from "mongoose";
import { UserModel } from "../models";

declare global {
  namespace Express {
    interface Request {
      user?: AnyObjectType;
    }
  }
}

const generateAccessAndRefreshToken = async (userId: Types.ObjectId) => {
  try {
    const user: any = await UserModel.findById(userId);
    const accessToken = user.generateAccessToken();

    return accessToken;
  } catch (error) {
    throw new AppError("Something went wrong while generating token", 500);
  }
};

// CREATE USER
export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email } = req.body;

    // check if user already exists: username, email
    const existedUser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      throw new AppError("User with email or username already exists", 409);
    }

    const newUser = await UserModel.create(req.body);

    await send_email({
      to: req.body.email,
      subject: `Action Required: Update Your ${TUITION_HIGHWAY} Password`,
      html: get_email_template_for_temporary_password(
        newUser.full_name,
        req.body.password
      ),
    });

    const createdUser = await UserModel.findById(newUser._id).select(
      "-password -refresh_token -__v -createdAt -updatedAt "
    );

    if (!createdUser) {
      throw new AppError("Something went wrong while registering a User", 500);
    }

    return res
      .status(201)
      .json(
        new AppResponse(
          201,
          createdUser,
          "User created succefully",
          ResponseStatus.SUCCESS
        )
      );
  }
);

// LOGIN USER
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const username = email;

    // 1) Check if email and password is exist
    if (!email) {
      return next(new AppError("username or email is required", 400));
    }

    // 2) Check if user exist and password is correct
    const user: any = await UserModel.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      throw new AppError("user doest not exist", 404);
    }

    if (user.account_status === AccountStatus.Deleted) {
      throw new AppError(
        "Your account has been deleted please contact with Adminitrstor to get back your account",
        404
      );
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid user credentials", 404);
    }

    const accessToken = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await UserModel.findById(user._id).select(
      "-password -__v -createdAt -updatedAt "
    );

    return res.status(200).json(
      new AppResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
        },
        "User Logged In Successfully",
        ResponseStatus.SUCCESS
      )
    );
  }
);
