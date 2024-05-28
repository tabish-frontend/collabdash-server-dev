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
exports.getUserLeaves = exports.addLeave = exports.getAllUserLeaves = void 0;
const models_1 = require("../models");
const utils_1 = require("../utils");
exports.getAllUserLeaves = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Find all leaves and populate the user information
    const allUserLeaves = yield models_1.LeavesModal.find().populate("user", "full_name username avatar");
    if (!allUserLeaves) {
        throw new utils_1.AppError("No leaves found", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, allUserLeaves, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.addLeave = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    const user_id = _id || req.body.user;
    const { date, reason, leave_type } = req.body;
    // Check if the leave is already applied for the same date
    const existingLeave = yield models_1.LeavesModal.findOne({
        user: user_id,
        date,
    });
    if (existingLeave) {
        throw new utils_1.AppError("Leave has already been applied for this date", 400);
    }
    const newLeave = yield models_1.LeavesModal.create({
        user: user_id,
        date,
        reason,
        leave_type,
    });
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, newLeave, "Leave Added Successfully", utils_1.ResponseStatus.SUCCESS));
}));
exports.getUserLeaves = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    // Find all leaves for the specified user
    const userLeaves = yield models_1.LeavesModal.find({ user: _id });
    if (!userLeaves) {
        throw new utils_1.AppError("No leaves found for the specified user", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, userLeaves, "", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=leavesController.js.map