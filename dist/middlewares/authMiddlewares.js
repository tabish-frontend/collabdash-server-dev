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
exports.restrictTo = exports.Protect = void 0;
const models_1 = require("../models");
const utils_1 = require("../utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.Protect = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            throw new utils_1.AppError("You are not logged in! Please login to get access.", 401);
        }
        const decodedUser = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield models_1.UserModel.findById(decodedUser === null || decodedUser === void 0 ? void 0 : decodedUser._id).select("-password -__v -createdAt -updatedAt ");
        if (!user) {
            throw new utils_1.AppError("Invalid Access Token", 401);
        }
        req.user = user;
        next();
    }
    catch (error) {
        throw new utils_1.AppError((error === null || error === void 0 ? void 0 : error.message) || "Invalid access token", 401);
    }
}));
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new utils_1.AppError("You dont have permisssion to perform this action", 403);
        }
        next();
    };
};
exports.restrictTo = restrictTo;
//# sourceMappingURL=authMiddlewares.js.map