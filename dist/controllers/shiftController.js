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
exports.updateShift = exports.addShift = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const utils_1 = require("../utils");
exports.addShift = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { times, weekends, user, shift_type, hours } = req.body;
    // Validate user existence
    const employee = yield models_1.UserModel.findById(user);
    if (!employee) {
        throw new utils_1.AppError("User not found", 404);
    }
    if (employee.shift) {
        throw new utils_1.AppError("User already has a shift assigned", 400);
    }
    // Create new shift
    const newShift = yield models_1.ShiftModel.create({
        user: new mongoose_1.Types.ObjectId(user),
        times,
        weekends,
        shift_type,
        hours,
    });
    // Update user with shiftId
    employee.shift = newShift._id;
    yield employee.save();
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, newShift, "Shift Added", utils_1.ResponseStatus.SUCCESS));
}));
exports.updateShift = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shift_id } = req.params;
    const { times, weekends, shift_type, hours } = req.body;
    // Validate shift existence
    const shift = yield models_1.ShiftModel.findById(shift_id);
    if (!shift) {
        throw new utils_1.AppError("Shift not found", 404);
    }
    // Update the shift details
    shift.times = times;
    shift.weekends = weekends;
    shift.shift_type = shift_type;
    shift.hours = hours;
    // Save the updated shift
    const updatedShift = yield shift.save();
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedShift, "Shift Updated", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=shiftController.js.map