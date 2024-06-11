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
exports.getUserAttendance = exports.getAllUsersAttendance = exports.getTodayAttendanceOfUser = exports.manageAttendanceLogs = void 0;
// import AppError from "../utils/app-error";
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("../utils");
const models_1 = require("../models");
const lookups_1 = require("../lookups");
exports.manageAttendanceLogs = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { notes } = req.body;
        const userId = req.user._id;
        const action = req.params.action;
        const currentDate = new Date();
        const currentDay = currentDate.toLocaleString("en-US", { weekday: "long" });
        const currentTime = currentDate.getTime();
        const startOfDay = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), 23, 59, 59, 999));
        // Validate if user exists
        const existingUser = yield models_1.UserModel.findById(userId);
        if (!existingUser) {
            throw new utils_1.AppError("User not found", 404);
        }
        // Check if an attendance record for the same user and date already exists
        let attendance = yield models_1.AttendanceModel.findOne({
            user: userId,
            date: { $gte: startOfDay, $lte: endOfDay },
        });
        if (!attendance) {
            if (action === "clockOut") {
                throw new utils_1.AppError("Cannot clock out without clocking in first", 400);
            }
            attendance = new models_1.AttendanceModel({
                user: userId,
                date: new Date(),
                status: utils_1.AttendanceStatus.ONLINE,
                timeIn: new Date(),
                notes,
            });
        }
        else {
            if (action === "clockIn") {
                throw new utils_1.AppError("You are already clocked in today", 400);
            }
            else if (action === "clockOut") {
                if (attendance.timeOut) {
                    throw new utils_1.AppError("You are already clocked out today", 400);
                }
                const timeOut = new Date();
                const timeIn = attendance.timeIn;
                const duration = (timeOut - timeIn) / (1000 * 60 * 60);
                if (duration < 4) {
                    attendance.status = utils_1.AttendanceStatus.SHORT_ATTENDANCE;
                }
                else if (duration >= 4 && duration < 8) {
                    attendance.status = utils_1.AttendanceStatus.HALF_DAY_PRESENT;
                }
                else {
                    attendance.status = utils_1.AttendanceStatus.FULL_DAY_PRESENT;
                }
                attendance.duration = duration;
                attendance.timeOut = timeOut;
            }
        }
        yield attendance.save();
        res
            .status(200)
            .json(new utils_1.AppResponse(200, { attendance }, `${action} Successfully`, utils_1.ResponseStatus.SUCCESS));
    }
    catch (error) {
        throw new utils_1.AppError((error === null || error === void 0 ? void 0 : error.message) || "Something went wrong", 401);
    }
}));
exports.getTodayAttendanceOfUser = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const currentDate = new Date();
        const startOfDay = new Date(currentDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(currentDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        const attendance = yield models_1.AttendanceModel.findOne({
            user: userId,
            date: { $gte: startOfDay, $lte: endOfDay },
        });
        if (!attendance) {
            throw new utils_1.AppError("Attendance not found for today", 404);
        }
        return res
            .status(200)
            .json(new utils_1.AppResponse(200, { attendance }, "", utils_1.ResponseStatus.SUCCESS));
    }
    catch (error) {
        throw new utils_1.AppError((error === null || error === void 0 ? void 0 : error.message) || "Something went wrong", 401);
    }
}));
exports.getAllUsersAttendance = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res
                .status(400)
                .json({ error: "Month and year are required parameters" });
        }
        const monthNumber = parseInt(month, 10);
        const yearNumber = parseInt(year, 10);
        const userExcludedFields = {
            password: 0,
            bio: 0,
            dob: 0,
            languages: 0,
            gender: 0,
            national_identity_number: 0,
            refresh_token: 0,
            __v: 0,
            createdAt: 0,
            updatedAt: 0,
        };
        const usersWithAttendance = yield models_1.UserModel.aggregate([
            ...req.pipelineModification,
            (0, lookups_1.lookupAttendance)(yearNumber, monthNumber),
            (0, lookups_1.lookupHolidays)(yearNumber, monthNumber),
            (0, lookups_1.lookupLeaves)(yearNumber, monthNumber),
            (0, lookups_1.lookupShift)(),
            {
                $unwind: {
                    path: "$shift",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: userExcludedFields,
            },
        ]);
        return res
            .status(200)
            .json(new utils_1.AppResponse(200, usersWithAttendance, "", utils_1.ResponseStatus.SUCCESS));
    }
    catch (error) {
        return next(new utils_1.AppError("Error fetching users attendance", 500));
    }
}));
exports.getUserAttendance = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.params;
        const { month, year } = req.query;
        if (!month || !year) {
            return res
                .status(400)
                .json({ error: "Month and year are required parameters" });
        }
        const monthNumber = parseInt(month, 10);
        const yearNumber = parseInt(year, 10);
        const attendanceExcludedFields = { createdAt: 0, updatedAt: 0, __v: 0 };
        const attendanceRecords = yield models_1.AttendanceModel.find({
            user: new mongoose_1.default.Types.ObjectId(_id),
            date: {
                $gte: new Date(yearNumber, monthNumber - 1, 1),
                $lt: new Date(yearNumber, monthNumber, 1),
            },
        }).select(attendanceExcludedFields);
        return res.status(200).json(new utils_1.AppResponse(200, {
            attendance: attendanceRecords,
        }, "", utils_1.ResponseStatus.SUCCESS));
    }
    catch (error) {
        throw new utils_1.AppError("Error fetching user attendance", 500);
    }
}));
//# sourceMappingURL=attendanceController.js.map