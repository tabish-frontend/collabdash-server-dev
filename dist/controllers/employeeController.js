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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmployee = exports.updateEmployee = exports.getEmployee = exports.getAllEmployees = void 0;
const utils_1 = require("../utils");
const types_1 = require("../types");
const models_1 = require("../models");
const handleFactory_1 = require("./handleFactory");
const getDayOfWeek = (date) => {
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    return days[date.getDay()];
};
const checkTodayStatus = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const dayOfWeek = getDayOfWeek(today);
    // Check if today is a holiday
    const holiday = yield models_1.HolidayModel.findOne({
        date: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
        },
        users: user._id,
    });
    if (holiday) {
        return "Holiday";
    }
    // Check if today is a leave day
    const leave = yield models_1.LeavesModel.findOne({
        user: user._id,
        startDate: { $lte: today },
        endDate: { $gte: today },
        status: "Approved",
    });
    if (leave) {
        return "On Leave";
    }
    // Check if today is a weekend
    if (user.shift && user.shift.weekends.includes(dayOfWeek)) {
        return "Weekend";
    }
    const attendance = yield models_1.AttendanceModel.findOne({
        user: user._id,
        date: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
        },
    });
    if (attendance) {
        if (attendance.timeIn && !attendance.timeOut) {
            return "Online";
        }
        else if (attendance.timeIn && attendance.timeOut) {
            const timeOut = new Date(attendance.timeOut);
            const timeIn = new Date(attendance.timeIn);
            const duration = (timeOut - timeIn) / (1000 * 60 * 60);
            if (duration < 4) {
                return "Short Attendance";
            }
            else if (duration >= 4 && duration < 8) {
                return "Half Day Present";
            }
            else {
                return "Full Day Present";
            }
        }
    }
    return "Offline";
});
exports.getAllEmployees = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let filter = { role: { $nin: req.excludedRoles } };
    const total_counts = yield models_1.UserModel.find();
    const features = new utils_1.APIFeatures(models_1.UserModel.find(filter), req.query)
        .filter()
        .search()
        .sort()
        .limitFields()
        .paginate();
    const document = yield features.query.select(utils_1.ExcludedFields);
    const populatedDocuments = yield models_1.UserModel.populate(document, {
        path: "shift",
    });
    // Add Today_Status to each user
    const usersWithStatus = yield Promise.all(populatedDocuments.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        const todayStatus = yield checkTodayStatus(user);
        return Object.assign(Object.assign({}, user._doc), { Today_Status: todayStatus });
    })));
    const usersWithoutShift = usersWithStatus.map((user) => {
        const { shift } = user, rest = __rest(user, ["shift"]);
        return rest;
    });
    return res.status(200).json(new utils_1.AppResponse(200, {
        users: usersWithoutShift,
        result: document.length,
        total_counts: total_counts.length,
    }, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.getEmployee = (0, handleFactory_1.getOne)(models_1.UserModel, utils_1.ExcludedFields);
exports.updateEmployee = (0, handleFactory_1.updateOne)(models_1.UserModel, utils_1.ExcludedFields);
exports.deleteEmployee = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const document = yield models_1.UserModel.findOneAndUpdate({ username: username }, {
        account_status: types_1.AccountStatus.Deleted,
    });
    if (!document) {
        throw new utils_1.AppError("No document found with that ID", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, {}, "User deleted  Successfully", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=employeeController.js.map