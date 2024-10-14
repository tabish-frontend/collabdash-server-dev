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
exports.clearAnddeleteColumn = exports.moveColumn = exports.updateColumn = exports.addColumn = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
exports.addColumn = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, board } = req.body;
    const owner = req.user._id;
    const newColumn = yield models_1.ColumnModel.create({
        name,
        owner,
        board,
    });
    yield models_1.BoardModel.findByIdAndUpdate(board, {
        $push: { columns: newColumn._id },
    });
    const populatedColumn = yield models_1.ColumnModel.findById(newColumn._id).populate("tasks");
    req.socket_board = board;
    next();
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, populatedColumn, "Column created", utils_1.ResponseStatus.SUCCESS));
}));
exports.updateColumn = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name } = req.body;
    const updatedColumn = yield models_1.ColumnModel.findByIdAndUpdate(id, { name }, { new: true }).populate("tasks");
    if (!updatedColumn) {
        throw new utils_1.AppError("Column not found", 404);
    }
    req.socket_board = updatedColumn.board;
    next();
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedColumn, "Column Updated", utils_1.ResponseStatus.SUCCESS));
}));
exports.moveColumn = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const { board_id, column_id, index } = req.body;
    // Find the board by ID
    const board = yield models_1.BoardModel.findById(board_id);
    if (!board) {
        throw new utils_1.AppError("Board not found", 404);
    }
    // Find the current index of the column
    const currentIndex = board.columns.indexOf(column_id);
    if (currentIndex === -1) {
        throw new utils_1.AppError("Column not found in the board", 404);
    }
    // Remove the column from its current position
    board.columns.splice(currentIndex, 1);
    // Insert the column into the new position
    board.columns.splice(index, 0, column_id);
    // Save the updated board
    yield board.save();
    const populatedBoard = yield models_1.BoardModel.findById(board_id)
        .populate("owner", "full_name username avatar")
        .populate("members", "full_name username avatar")
        .populate({
        path: "columns",
        populate: {
            path: "tasks",
            model: "Task",
        },
    });
    req.socket_board = board_id;
    next();
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, populatedBoard, "Column moved", utils_1.ResponseStatus.SUCCESS));
}));
exports.clearAnddeleteColumn = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const { id } = req.params;
    const { type } = req.query;
    const column = yield models_1.ColumnModel.findById(id);
    if (!column) {
        throw new utils_1.AppError("No Column found with that ID", 400);
    }
    // Step 1: Delete all tasks related to the column
    yield models_1.TaskModel.deleteMany({ _id: { $in: column.tasks } });
    // Step 2: Remove task IDs from BoardModel and ColumnModel
    yield models_1.ColumnModel.findByIdAndUpdate(id, {
        $set: { tasks: [] },
    });
    yield models_1.BoardModel.findByIdAndUpdate(column.board, {
        $pull: { tasks: { $in: column.tasks } },
    });
    // Step 3: If the type is "delete", remove the column ID from BoardModel and delete the column
    if (type === "delete") {
        yield models_1.ColumnModel.findByIdAndDelete(id);
        yield models_1.BoardModel.findByIdAndUpdate(column.board, {
            $pull: { columns: id },
        });
    }
    req.socket_board = column.board;
    next();
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, null, type === "delete" ? "Column deleted" : "Column  cleared", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=columnController.js.map