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
exports.deleteHoliday = exports.updateHoliday = exports.getUserHolidays = exports.getAllUserHolidays = exports.addHoliday = void 0;
const models_1 = require("../models");
const utils_1 = require("../utils");
exports.addHoliday = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date } = req.body;
    const existingHoliday = yield models_1.HolidayModel.findOne({ date });
    if (existingHoliday) {
        throw new utils_1.AppError("Holiday already exists for this date", 409);
    }
    const newHoliday = yield models_1.HolidayModel.create(req.body);
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, newHoliday, "Holiday Added", utils_1.ResponseStatus.SUCCESS));
}));
exports.getAllUserHolidays = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const year = req.query.year
        ? parseInt(req.query.year)
        : new Date().getFullYear();
    // Calculate the start and end dates of the specified year
    const startDate = new Date(`${year}-01-01T00:00:00Z`);
    const endDate = new Date(`${year}-12-31T23:59:59Z`);
    // Find holidays within the date range and populate user references
    const holidays = yield models_1.HolidayModel.find({
        date: {
            $gte: startDate,
            $lte: endDate,
        },
    })
        .populate("users", "full_name username avatar")
        .sort({ date: 1 });
    if (!holidays.length) {
        throw new utils_1.AppError("No holidays found for the specified year", 409);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, holidays, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.getUserHolidays = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    console.log("_id", _id);
    const year = req.query.year
        ? parseInt(req.query.year)
        : new Date().getFullYear();
    console.log("year", year);
    // Calculate the start and end dates of the specified year
    const startDate = new Date(`${year}-01-01T00:00:00Z`);
    const endDate = new Date(`${year}-12-31T23:59:59Z`);
    // Find all holidays for the specified user
    const userHolidays = yield models_1.HolidayModel.find({
        users: _id,
        date: {
            $gte: startDate,
            $lte: endDate,
        },
    }).select("-users");
    console.log("userHolidays", userHolidays);
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, userHolidays, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.updateHoliday = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    const { date } = req.body;
    // Check if a holiday with the same date already exists (excluding the current holiday)
    // const existingHoliday = await HolidayModel.findOne({ date });
    const existingHoliday = yield models_1.HolidayModel.findOne({
        date,
        _id: { $ne: _id }, // Exclude the current holiday being updated
    });
    if (existingHoliday) {
        throw new utils_1.AppError("A holiday with the same date already exists", 400);
    }
    const updatedHoliday = yield models_1.HolidayModel.findByIdAndUpdate(_id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!updatedHoliday) {
        throw new utils_1.AppError("No Holiday found with that ID", 400);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedHoliday, "Holiday Updated", utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteHoliday = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    const holiday = yield models_1.HolidayModel.findByIdAndDelete(_id);
    if (!holiday) {
        throw new utils_1.AppError("No Holiday found with that ID", 400);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, null, "Holiday Deleted", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=holidayControllers.js.map