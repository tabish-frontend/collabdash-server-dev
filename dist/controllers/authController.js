"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyPassword = exports.resetPassword = exports.forgotPassword = exports.login = exports.signup = void 0;
const types_1 = require("../types");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../utils");
const email_1 = require("../config/email");
const models_1 = require("../models");
const generateAccessAndRefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield models_1.UserModel.findById(userId);
        const accessToken = user.generateAccessToken();
        return accessToken;
    }
    catch (error) {
        throw new utils_1.AppError("Something went wrong while generating token", 500);
    }
});
// CREATE USER
exports.signup = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email } = req.body;
    // check if user already exists: username, email
    const existedUser = yield models_1.UserModel.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new utils_1.AppError("User with email or username already exists", 409);
    }
    const newUser = yield models_1.UserModel.create(req.body);
    console.log("password", req.body.password);
    yield (0, email_1.send_email)({
        to: req.body.email,
        subject: `Action Required: Update Your ${utils_1.TUITION_HIGHWAY} Password`,
        html: (0, utils_1.get_email_template_for_temporary_password)(newUser.full_name, req.body.password),
    });
    const createdUser = yield models_1.UserModel.findById(newUser._id).select(utils_1.ExcludedFields);
    if (!createdUser) {
        throw new utils_1.AppError("Something went wrong while registering a User", 500);
    }
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, createdUser, "User created succefully", utils_1.ResponseStatus.SUCCESS));
}));
// LOGIN USER
exports.login = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const username = email;
    // 1) Check if email and password is exist
    if (!email) {
        return next(new utils_1.AppError("username or email is required", 400));
    }
    // 2) Check if user exist and password is correct
    const user = yield models_1.UserModel.findOne({
        $or: [{ username }, { email }],
    });
    if (!user) {
        throw new utils_1.AppError("user doest not exist", 404);
    }
    if (user.account_status === types_1.AccountStatus.Deleted) {
        throw new utils_1.AppError("Your account has been deleted please contact with Adminitrstor to get back your account", 404);
    }
    const isPasswordValid = yield user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new utils_1.AppError("Invalid user credentials", 401);
    }
    const accessToken = yield generateAccessAndRefreshToken(user._id);
    const loggedInUser = yield models_1.UserModel.findById(user._id).select(utils_1.ExcludedFields);
    return res.status(200).json(new utils_1.AppResponse(200, {
        user: loggedInUser,
        accessToken,
    }, "User Logged In Successfully", utils_1.ResponseStatus.SUCCESS));
}));
// FORGOT PASSWORD
exports.forgotPassword = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const username = email;
    // 1) Check if email is exist
    if (!email) {
        return next(new utils_1.AppError("Please provide email or username!", 400));
    }
    // 2) Get user based on POSTed email
    const user = yield models_1.UserModel.findOne({
        $or: [{ username }, { email }],
    });
    if (!user) {
        throw new utils_1.AppError("There is no user exist with that email address.", 404);
    }
    // 3) Generate the random reset token
    const accessToken = yield generateAccessAndRefreshToken(user._id);
    try {
        const resetURL = `${process.env.ORIGIN_CLIENT_LIVE}/reset-password/${accessToken}`;
        yield (0, email_1.send_email)({
            to: user.email,
            subject: `Password Reset Instructions for Your ${utils_1.TUITION_HIGHWAY} Account.`,
            html: (0, utils_1.get_email_template_for_reset_password)(user.full_name, resetURL),
        });
        return res.status(200).json(new utils_1.AppResponse(200, {
            resetURL: resetURL,
            accessToken,
        }, "Reset Password link sent to your email!", utils_1.ResponseStatus.SUCCESS));
    }
    catch (err) {
        return next(new utils_1.AppError("There was an error sending the email. Try again leter!", 500));
    }
}));
// RESET PASSWORD
exports.resetPassword = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const incomingAccessToken = req.params.token;
    console.log("incomingRefreshToken", incomingAccessToken);
    if (!incomingAccessToken) {
        throw new utils_1.AppError("Unauthorized request", 401);
    }
    // 1) Get user based on the token
    try {
        const decodedToken = jsonwebtoken_1.default.verify(incomingAccessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = yield models_1.UserModel.findById(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken._id);
        if (!user) {
            throw new utils_1.AppError("Invalid access token", 401);
        }
        user.password = req.body.password;
        yield user.save({ validateBeforeSave: false });
        return res
            .status(200)
            .json(new utils_1.AppResponse(200, {}, "Password Changed successfully", utils_1.ResponseStatus.SUCCESS));
    }
    catch (error) {
        throw new utils_1.AppError((error === null || error === void 0 ? void 0 : error.message) || "Invalid access token", 401);
    }
}));
// UPDATE CURRENT USER PASSWORD
exports.updateMyPassword = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user from collection
    const user = yield models_1.UserModel.findById(req.user._id);
    // 2) Check if Posted current password is correct
    if (!(yield user.isPasswordCorrect(req.body.current_password))) {
        throw new utils_1.AppError("Your current password is wrong", 401);
    }
    // 3) If so, update password
    user.password = req.body.password;
    yield user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, {}, "Password changed Successfully Please Login Again", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=authController.js.map