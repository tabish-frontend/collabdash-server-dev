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
exports.updateAttendance = exports.getUserAttendance = exports.getAllUsersAttendance = exports.getTodayAttendanceOfUser = exports.manageAttendanceLogs = void 0;
// import AppError from "../utils/app-error";
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("../utils");
const models_1 = require("../models");
const lookups_1 = require("../lookups");
exports.manageAttendanceLogs = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const action = req.params.action;
        const currentDate = new Date();
        const startOfDay = new Date(currentDate.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(currentDate.setUTCHours(23, 59, 59, 999));
        yield (0, utils_1.validateUser)(userId);
        let attendance = yield (0, utils_1.findAttendance)(userId, startOfDay, endOfDay);
        switch (action) {
            case "clockIn":
                attendance = (0, utils_1.handleClockIn)(attendance, userId);
                break;
            case "clockOut":
                attendance = (0, utils_1.handleClockOut)(attendance);
                break;
            case "break":
                attendance = (0, utils_1.handleBreak)(attendance);
                break;
            case "resume":
                attendance = (0, utils_1.handleResume)(attendance);
                break;
            default:
                throw new utils_1.AppError("Invalid action", 401);
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
        throw new utils_1.AppError((error === null || error === void 0 ? void 0 : error.message) || "Something went wrong", 404);
    }
}));
exports.getAllUsersAttendance = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { month, year, view, date } = req.query;
        if (!month || !year || !view) {
            return res
                .status(400)
                .json({ error: "Month, year, and view are required parameters" });
        }
        const specificDate = date ? new Date(date) : null;
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
            (0, lookups_1.lookupAttendance)(year, month, view, specificDate),
            (0, lookups_1.lookupHolidays)(year, month, view, specificDate),
            (0, lookups_1.lookupLeaves)(year, month, view, specificDate),
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
        const { month, year, view, date } = req.query;
        if (!month || !year || !view) {
            return res
                .status(400)
                .json({ error: "Month, year, and view are required parameters" });
        }
        const monthNumber = parseInt(month, 10);
        const yearNumber = parseInt(year, 10);
        const specificDate = date ? new Date(date) : null;
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
        const userWithAttendance = yield models_1.UserModel.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(_id),
                },
            },
            (0, lookups_1.lookupAttendance)(yearNumber, monthNumber, view, specificDate),
            (0, lookups_1.lookupHolidays)(yearNumber, monthNumber, view, specificDate),
            (0, lookups_1.lookupLeaves)(yearNumber, monthNumber, view, specificDate),
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
        if (!userWithAttendance.length) {
            return res
                .status(404)
                .json({ error: "User not found or no attendance records available" });
        }
        return res
            .status(200)
            .json(new utils_1.AppResponse(200, { data: userWithAttendance[0] }, "", utils_1.ResponseStatus.SUCCESS));
    }
    catch (error) {
        throw new utils_1.AppError("Error fetching user attendance", 500);
    }
}));
exports.updateAttendance = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { attendanceId } = req.params;
    const { timeIn, timeOut } = req.body;
    if (!attendanceId) {
        throw new utils_1.AppError("Attendance ID is required'", 400);
    }
    if (!timeIn) {
        throw new utils_1.AppError("TimeIn value is required", 400);
    }
    let status;
    let duration = 0;
    if (timeIn && timeOut) {
        duration = new Date(timeOut).getTime() - new Date(timeIn).getTime();
        const DurationHours = duration / (1000 * 60 * 60);
        if (DurationHours < 4) {
            status = utils_1.AttendanceStatus.SHORT_ATTENDANCE;
        }
        else if (DurationHours >= 4 && DurationHours < 8) {
            status = utils_1.AttendanceStatus.HALF_DAY_PRESENT;
        }
        else {
            status = utils_1.AttendanceStatus.FULL_DAY_PRESENT;
        }
    }
    else {
        status = utils_1.AttendanceStatus.ONLINE;
    }
    const updatedAttendance = yield models_1.AttendanceModel.findByIdAndUpdate(attendanceId, {
        timeIn: new Date(timeIn),
        timeOut: timeOut ? new Date(timeOut) : null,
        status,
        duration,
    });
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedAttendance, "Attendance updated successfully", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=attendanceController.js.map