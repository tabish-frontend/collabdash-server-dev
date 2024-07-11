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
exports.formatTime = exports.getDatesInMonth = exports.checkShift = exports.checkLeave = exports.checkHoliday = exports.isFilesObject = void 0;
const models_1 = require("../models");
const utils_1 = require("../utils");
const isFilesObject = (files) => {
    return files && typeof files === "object" && !Array.isArray(files);
};
exports.isFilesObject = isFilesObject;
function checkHoliday(userId, startOfDay, endOfDay) {
    return __awaiter(this, void 0, void 0, function* () {
        const isHoliday = yield models_1.HolidayModel.findOne({
            users: userId,
            date: { $gte: startOfDay, $lte: endOfDay },
        });
        if (isHoliday) {
            throw new utils_1.AppError("Cannot mark attendance on a Holiday", 400);
        }
    });
}
exports.checkHoliday = checkHoliday;
function checkLeave(userId, startOfDay, endOfDay) {
    return __awaiter(this, void 0, void 0, function* () {
        const isOnLeave = yield models_1.LeavesModel.findOne({
            user: userId,
            status: utils_1.LeavesStatus.Approved,
            startDate: { $lte: endOfDay },
            endDate: { $gte: startOfDay },
        });
        if (isOnLeave) {
            throw new utils_1.AppError("Cannot mark attendance on Leave", 400);
        }
    });
}
exports.checkLeave = checkLeave;
function checkShift(userId, currentDay, currentTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const shift = yield models_1.ShiftModel.findOne({ user: userId });
        if (shift) {
            if (shift.weekends.includes(currentDay)) {
                throw new utils_1.AppError(`Cannot mark attendance on a weekend (${currentDay})`, 400);
            }
            const shiftMatch = shift.times.some((timeDetail) => {
                const shiftStart = new Date(timeDetail.start).getTime();
                const shiftEnd = new Date(timeDetail.end).getTime();
                return (timeDetail.days.includes(currentDay) &&
                    currentTime >= shiftStart &&
                    currentTime <= shiftEnd);
            });
            if (!shiftMatch) {
                throw new utils_1.AppError("Current time does not match your shift schedule", 400);
            }
        }
        else {
            throw new utils_1.AppError(`Shifts were not added`, 400);
        }
    });
}
exports.checkShift = checkShift;
const getDatesInMonth = (month, year) => {
    const dates = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month - 1, i);
        const formattedDate = date
            .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
        })
            .replace(/ /g, " ");
        dates.push(formattedDate);
    }
    return dates;
};
exports.getDatesInMonth = getDatesInMonth;
const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
};
exports.formatTime = formatTime;
//# sourceMappingURL=helper.js.map