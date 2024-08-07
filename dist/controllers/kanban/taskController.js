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
exports.addTask = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
exports.addTask = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, board, column } = req.body;
    const owner = req.user._id;
    // Create the new task
    const newTask = yield models_1.TaskModel.create({
        title,
        board,
        column,
        owner,
    });
    // Add the new task to the column
    yield models_1.ColumnModel.findByIdAndUpdate(column, {
        $push: { tasks: newTask._id },
    });
    // Add the new task to the board
    yield models_1.BoardModel.findByIdAndUpdate(board, {
        $push: { tasks: newTask._id },
    });
    // Populate the necessary fields
    const populatedTask = yield models_1.TaskModel.findById(newTask._id)
        .populate("owner", "full_name username avatar")
        .populate("assignedTo", "full_name username avatar");
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, populatedTask, "Task created successfully", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=taskController.js.map