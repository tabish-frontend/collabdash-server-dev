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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodayAttendanceOfUser = exports.manageAttendanceLogs = void 0;
// import AppError from "../utils/app-error";
const utils_1 = require("../utils");
const models_1 = require("../models");
exports.manageAttendanceLogs = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { notes } = req.body;
        const userId = req.user._id;
        const action = req.params.action; // "clockIn" or "clockOut"
        const currentDate = new Date();
        const startOfDay = new Date(currentDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(currentDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        // Validate if user exists
        const existingUser = yield models_1.UserModel.findById(userId);
        if (!existingUser) {
            throw new utils_1.AppError("User not found", 404);
        }
        // Check if an attendance record for the same user and date already exists
        let attendance = yield models_1.AttendanceModal.findOne({
            user: userId,
            date: { $gte: startOfDay, $lte: endOfDay },
        });
        if (!attendance) {
            if (action === "clockOut") {
                throw new utils_1.AppError("Cannot clock out without clocking in first", 400);
            }
            // Create a new attendance record if none exists and the action is clockIn
            attendance = new models_1.AttendanceModal({
                user: userId,
                date: new Date(),
                status: "Present",
                timeIn: new Date(),
                notes,
            });
        }
        else {
            // Update the existing attendance record based on the action
            if (action === "clockIn") {
                throw new utils_1.AppError("You are already clocked in today", 400);
            }
            else if (action === "clockOut") {
                if (attendance.timeOut) {
                    throw new utils_1.AppError("You are already clocked out today", 400);
                }
                // Calculate duration between timeIn and timeOut
                const timeOut = new Date();
                const timeIn = attendance.timeIn;
                const duration = (timeOut - timeIn) / (1000 * 60 * 60); // Duration in hours
                console.log("duration", duration);
                if (duration < 4) {
                    attendance.status = "Short Attendance";
                }
                else if (duration >= 4 && duration < 8) {
                    attendance.status = "Half Day";
                }
                else {
                    attendance.status = "Full Day";
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
        const attendance = yield models_1.AttendanceModal.findOne({
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
//# sourceMappingURL=attendanceController.js.map