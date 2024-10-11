import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { AccountStatus, AnyObjectType } from "../types";
import jwt from "jsonwebtoken";
import {
  AppError,
  TUITION_HIGHWAY,
  catchAsync,
  ResponseStatus,
  get_email_template_for_temporary_password,
  AppResponse,
  get_email_template_for_reset_password,
  ExcludedFields,
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

    // if (existedUser.account_status === AccountStatus.Deleted) {
    //   throw new AppError(
    //     "User with email or username already exists in databse but Deleted",
    //     409
    //   );
    // }

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
      ExcludedFields
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
          "Employee Created",
          ResponseStatus.SUCCESS
        )
      );
  }
);

// LOGIN USER
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    console.log("req.body", req.body);

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

    if (user.account_status !== AccountStatus.Active) {
      throw new AppError(
        "Your account has been temporary locked, contact to HR to activate your account",
        404
      );
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid user credentials", 401);
    }

    const accessToken = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await UserModel.findById(user._id).select(
      ExcludedFields
    );

    return res.status(200).json(
      new AppResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
        },
        "Welcome to CollabDash",
        ResponseStatus.SUCCESS
      )
    );
  }
);

// FORGOT PASSWORD
export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const username = email;

    // 1) Check if email is exist
    if (!email) {
      return next(new AppError("Please provide email or username!", 400));
    }

    // 2) Get user based on POSTed email
    const user = await UserModel.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      throw new AppError(
        "There is no user exist with that email address.",
        404
      );
    }

    // 3) Generate the random reset token
    const accessToken = await generateAccessAndRefreshToken(user._id);

    try {
      const resetURL = `${process.env.ORIGIN_CLIENT_LIVE}/reset-password/${accessToken}`;

      await send_email({
        to: user.email,
        subject: `Password Reset Instructions for Your ${TUITION_HIGHWAY} Account.`,
        html: get_email_template_for_reset_password(user.full_name, resetURL),
      });

      return res.status(200).json(
        new AppResponse(
          200,
          {
            resetURL: resetURL,
            accessToken,
          },
          "Reset Password link sent to your email!",
          ResponseStatus.SUCCESS
        )
      );
    } catch (err) {
      return next(
        new AppError(
          "There was an error sending the email. Try again leter!",
          500
        )
      );
    }
  }
);

// RESET PASSWORD
export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const incomingAccessToken = req.params.token;

    if (!incomingAccessToken) {
      throw new AppError("Unauthorized request", 401);
    }

    // 1) Get user based on the token

    try {
      const decodedToken: any = jwt.verify(
        incomingAccessToken,
        process.env.ACCESS_TOKEN_SECRET
      );

      const user = await UserModel.findById(decodedToken?._id);

      if (!user) {
        throw new AppError("Invalid access token", 401);
      }

      user.password = req.body.password;
      await user.save({ validateBeforeSave: false });

      return res
        .status(200)
        .json(
          new AppResponse(
            200,
            {},
            "Password Changed successfully",
            ResponseStatus.SUCCESS
          )
        );
    } catch (error) {
      throw new AppError(error?.message || "Invalid access token", 401);
    }
  }
);

// UPDATE CURRENT USER PASSWORD
export const updateMyPassword = catchAsync(async (req, res) => {
  // 1) Get user from collection
  const user: any = await UserModel.findById(req.user._id);

  // 2) Check if Posted current password is correct
  if (!(await user.isPasswordCorrect(req.body.current_password))) {
    throw new AppError("Your current password is wrong", 401);
  }

  // 3) If so, update password
  user.password = req.body.password;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        {},
        "Password changed Successfully Please Login Again",
        ResponseStatus.SUCCESS
      )
    );
});
