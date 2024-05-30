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
exports.updateLeaveStatus = exports.deleteLeave = exports.updateLeave = exports.addLeave = exports.getUserLeaves = exports.getAllUserLeaves = void 0;
const models_1 = require("../models");
const utils_1 = require("../utils");
exports.getAllUserLeaves = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Find all leaves and populate the user information
    const allUserLeaves = yield models_1.LeavesModel.find().populate("user", "full_name username avatar");
    if (!allUserLeaves) {
        throw new utils_1.AppError("No leaves found", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, allUserLeaves, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.getUserLeaves = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    // Find all leaves for the specified user
    const userLeaves = yield models_1.LeavesModel.find({ user: _id });
    if (!userLeaves) {
        throw new utils_1.AppError("No leaves found for the specified user", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, userLeaves, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.addLeave = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    const user_id = _id || req.body.user;
    const { startDate, endDate, reason, leave_type } = req.body;
    // Check if there is an overlapping leave for the user
    const overlappingLeave = yield models_1.LeavesModel.findOne({
        user: user_id,
        $or: [
            { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
            { startDate: { $gte: startDate, $lte: endDate } },
            { endDate: { $gte: startDate, $lte: endDate } },
        ],
    });
    if (overlappingLeave) {
        throw new utils_1.AppError("Leave already applied for overlapping dates", 400);
    }
    const newLeave = yield models_1.LeavesModel.create({
        user: user_id,
        startDate,
        endDate,
        reason,
        leave_type,
    });
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, newLeave, "Leave Added Successfully", utils_1.ResponseStatus.SUCCESS));
}));
exports.updateLeave = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { leave_id } = req.params;
    const { startDate, endDate } = req.body;
    // Find the leave to update
    const leaveToUpdate = yield models_1.LeavesModel.findById(leave_id);
    if (!leaveToUpdate) {
        throw new utils_1.AppError("No leave found with that ID", 404);
    }
    // Check if there is an overlapping leave for the user
    const overlappingLeave = yield models_1.LeavesModel.findOne({
        user: leaveToUpdate.user,
        _id: { $ne: leave_id },
        $or: [
            { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
            { startDate: { $gte: startDate, $lte: endDate } },
            { endDate: { $gte: startDate, $lte: endDate } },
        ],
    });
    if (overlappingLeave) {
        throw new utils_1.AppError("Leave already exists for overlapping dates", 400);
    }
    const updatedLeave = yield models_1.LeavesModel.findByIdAndUpdate(leave_id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!updatedLeave) {
        throw new utils_1.AppError("No Leave found with that ID", 400);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedLeave, "Leave Updated", utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteLeave = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { leave_id } = req.params;
    const holiday = yield models_1.LeavesModel.findByIdAndDelete(leave_id);
    if (!holiday) {
        throw new utils_1.AppError("No Leave found with that ID", 400);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, null, "Leave Deleted", utils_1.ResponseStatus.SUCCESS));
}));
exports.updateLeaveStatus = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { leave_id, status } = req.params;
    // Validate the status
    if (!Object.values(utils_1.LeavesStatus).includes(status)) {
        throw new utils_1.AppError("Invalid leave status", 400);
    }
    // Find the leave and update its status
    const leaveToUpdate = yield models_1.LeavesModel.findByIdAndUpdate(leave_id, { status }, { new: true, runValidators: true });
    if (!leaveToUpdate) {
        throw new utils_1.AppError("No leave found with that ID", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, leaveToUpdate, `Leave ${status}`, utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=leavesController.js.map