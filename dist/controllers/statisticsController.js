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
exports.allUserTodayAttendanceStatistics = exports.getAllUserAttendanceStatistics = exports.getAllUserStatistics = void 0;
const types_1 = require("../types");
const models_1 = require("../models");
const utils_1 = require("../utils");
exports.getAllUserStatistics = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Count male users excluding HR and Admin
    const maleUsers = yield models_1.UserModel.countDocuments({
        account_status: "active",
        gender: "male",
        role: { $nin: req.excludedRoles },
    });
    // Count female users excluding HR and Admin
    const femaleUsers = yield models_1.UserModel.countDocuments({
        account_status: "active",
        gender: "female",
        role: { $nin: req.excludedRoles },
    });
    return res.status(200).json(new utils_1.AppResponse(200, {
        man: maleUsers,
        women: femaleUsers,
    }, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.getAllUserAttendanceStatistics = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { month, year } = req.query;
    const monthNumber = parseInt(month, 10);
    const yearNumber = parseInt(year, 10);
    const startDate = new Date(yearNumber, monthNumber - 1, 1);
    const endDate = new Date(yearNumber, monthNumber, 0);
    try {
        const totalEmployees = yield models_1.UserModel.countDocuments({
            account_status: types_1.AccountStatus.Active,
            role: { $nin: req.excludedRoles },
        });
        const employeeIds = yield models_1.UserModel.find({
            account_status: types_1.AccountStatus.Active,
            role: { $nin: req.excludedRoles },
        }).distinct("_id");
        // Fetch attendance data for the month, excluding specific roles
        const attendanceData = yield models_1.AttendanceModel.find({
            date: {
                $gte: startDate,
                $lt: endDate,
            },
            user: { $in: employeeIds },
        });
        // Create a map for attendance data
        const attendanceMap = {};
        attendanceData.forEach((record) => {
            const dateStr = new Date(record.date)
                .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
            })
                .replace(/ /g, " ");
            if (!attendanceMap[dateStr]) {
                attendanceMap[dateStr] = { present: 0, absent: 0 };
            }
            attendanceMap[dateStr].present++;
        });
        const datesInMonth = (0, utils_1.getDatesInMonth)(monthNumber, year);
        const responseData = {};
        datesInMonth.forEach((date) => {
            const attendance = attendanceMap[date] || {
                present: 0,
                absent: totalEmployees,
            };
            if (!attendanceMap[date]) {
                attendance.absent = totalEmployees;
            }
            else {
                attendance.absent = totalEmployees - attendance.present;
            }
            responseData[date] = attendance;
        });
        return res
            .status(200)
            .json(new utils_1.AppResponse(200, responseData, "", utils_1.ResponseStatus.SUCCESS));
    }
    catch (error) {
        throw new utils_1.AppError("Error Fetching Attendance Statistics", 500);
    }
}));
exports.allUserTodayAttendanceStatistics = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setUTCHours(23, 59, 59, 999));
    const totalEmployees = yield models_1.UserModel.countDocuments({
        account_status: types_1.AccountStatus.Active,
        role: { $nin: req.excludedRoles },
    });
    const employeeIds = yield models_1.UserModel.find({
        account_status: types_1.AccountStatus.Active,
        role: { $nin: req.excludedRoles },
    }).distinct("_id");
    const leaveUsers = yield models_1.LeavesModel.countDocuments({
        user: employeeIds,
        status: utils_1.LeavesStatus.Approved,
        startDate: { $lte: endOfDay },
        endDate: { $gte: startOfDay },
    });
    const attendanceRecords = yield models_1.AttendanceModel.find({
        user: { $in: employeeIds },
        date: { $gte: startOfDay, $lt: endOfDay },
    });
    let presentUsers = 0;
    let lateUsers = 0;
    const shiftRecords = yield models_1.ShiftModel.find({
        user: { $in: employeeIds },
        shift_type: "Fixed",
    });
    const shiftMap = new Map();
    shiftRecords.forEach((shift) => {
        shiftMap.set(shift.user.toString(), shift);
    });
    attendanceRecords.forEach((attendance) => {
        const userShift = shiftMap.get(attendance.user.toString());
        if (userShift) {
            const userShiftTime = userShift.times.find((time) => time.days.includes(currentDate.toLocaleDateString("en-US", { weekday: "long" })));
            if (userShiftTime) {
                if (attendance.timeIn > userShiftTime.start) {
                    lateUsers++;
                }
            }
        }
        presentUsers++;
    });
    return res.status(200).json(new utils_1.AppResponse(200, {
        present: presentUsers,
        leave: leaveUsers,
        absent: totalEmployees - presentUsers - leaveUsers,
        on_late: lateUsers,
    }, "", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=statisticsController.js.map