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
exports.handleResume = exports.handleBreak = exports.handleClockOut = exports.handleClockIn = exports.findAttendance = exports.validateUser = void 0;
const models_1 = require("../models");
const app_error_1 = require("./app-error");
const utils_1 = require("../utils");
// Helper function to validate user
const validateUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield models_1.UserModel.findById(userId);
    if (!user) {
        throw new app_error_1.AppError("User not found", 404);
    }
});
exports.validateUser = validateUser;
// Helper function to find attendance
const findAttendance = (userId, startOfDay, endOfDay) => __awaiter(void 0, void 0, void 0, function* () {
    return yield models_1.AttendanceModel.findOne({
        user: userId,
        date: { $gte: startOfDay, $lte: endOfDay },
    });
});
exports.findAttendance = findAttendance;
// Helper function to handle clock in
const handleClockIn = (attendance, userId) => {
    if (attendance) {
        throw new app_error_1.AppError("You are already clocked in today", 400);
    }
    return new models_1.AttendanceModel({
        user: userId,
        date: new Date(),
        status: utils_1.AttendanceStatus.ONLINE,
        timeIn: new Date(),
    });
};
exports.handleClockIn = handleClockIn;
// Helper function to handle clock out
const handleClockOut = (attendance, shiftDuration) => {
    if (!attendance) {
        throw new app_error_1.AppError("Cannot clock out without clocking in first", 400);
    }
    if (attendance.timeOut) {
        throw new app_error_1.AppError("You are already clocked out today", 400);
    }
    // Check if there is an open break
    const openBreak = attendance.breaks.some((breakItem) => !breakItem.end);
    if (openBreak) {
        throw new app_error_1.AppError("Cannot clock out while a break is open", 400);
    }
    const timeOut = new Date();
    const timeIn = new Date(attendance.timeIn);
    const totalBreakDurationMs = attendance.breaks.reduce((total, breakItem) => {
        return total + (breakItem.duration || 0);
    }, 0);
    const totalAttendanceDurationMs = timeOut.getTime() - timeIn.getTime();
    const actualWorkingDurationMs = totalAttendanceDurationMs - totalBreakDurationMs;
    const actualWorkingDurationHours = actualWorkingDurationMs / (1000 * 60 * 60);
    if (actualWorkingDurationHours < 4) {
        attendance.status = utils_1.AttendanceStatus.SHORT_ATTENDANCE;
    }
    else if (actualWorkingDurationHours >= 4 &&
        actualWorkingDurationHours < shiftDuration) {
        attendance.status = utils_1.AttendanceStatus.HALF_DAY_PRESENT;
    }
    else {
        attendance.status = utils_1.AttendanceStatus.FULL_DAY_PRESENT;
    }
    attendance.duration = actualWorkingDurationMs;
    attendance.timeOut = timeOut;
    return attendance;
};
exports.handleClockOut = handleClockOut;
// Helper function to handle break
const handleBreak = (attendance) => {
    if (!attendance) {
        throw new app_error_1.AppError("Please Clock In first", 400);
    }
    if (attendance.timeOut) {
        throw new app_error_1.AppError("Cannot break after clocking out", 400);
    }
    const newBreak = {
        start: new Date(),
        end: null,
        duration: 0,
    };
    attendance.breaks.push(newBreak);
    return attendance;
};
exports.handleBreak = handleBreak;
// Helper function to handle resume
const handleResume = (attendance) => {
    if (attendance.timeOut) {
        throw new app_error_1.AppError("Cannot resume break after clocking out", 400);
    }
    const lastBreak = attendance.breaks[attendance.breaks.length - 1];
    if (!lastBreak || lastBreak.end !== null) {
        throw new app_error_1.AppError("No break to resume", 400);
    }
    const endTime = new Date();
    const duration = endTime.getTime() - lastBreak.start.getTime();
    lastBreak.end = endTime;
    lastBreak.duration = duration;
    return attendance;
};
exports.handleResume = handleResume;
//# sourceMappingURL=attendance-actions.js.map