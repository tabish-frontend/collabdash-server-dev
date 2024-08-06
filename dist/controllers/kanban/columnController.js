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
exports.deleteColumn = exports.moveColumn = exports.updateColumn = exports.addColumn = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
exports.addColumn = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, populatedColumn, "Column created successfully", utils_1.ResponseStatus.SUCCESS));
}));
exports.updateColumn = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name } = req.body;
    const updatedColumn = yield models_1.ColumnModel.findByIdAndUpdate(id, { name }, { new: true }).populate("tasks");
    if (!updatedColumn) {
        throw new utils_1.AppError("Column not found", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedColumn, "Column Updated", utils_1.ResponseStatus.SUCCESS));
}));
exports.moveColumn = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { boardID } = req.params;
    const { column_id, index } = req.body;
    console.log("move boardID", boardID);
    // Find the board by ID
    const board = yield models_1.BoardModel.findById(boardID);
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
    const populatedBoard = yield models_1.BoardModel.findById(boardID)
        .populate("owner", "full_name username avatar")
        .populate("members", "full_name username avatar")
        .populate({
        path: "columns",
        populate: {
            path: "tasks",
            model: "Task",
        },
    });
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, populatedBoard, "Column moved successfully", utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteColumn = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedColumn = yield models_1.ColumnModel.findByIdAndDelete(id);
    yield models_1.BoardModel.findByIdAndUpdate(deletedColumn.board, {
        $pull: { columns: id },
    });
    if (!deletedColumn) {
        throw new utils_1.AppError("No Column found with that ID", 400);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, null, "Column Deleted", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=columnController.js.map