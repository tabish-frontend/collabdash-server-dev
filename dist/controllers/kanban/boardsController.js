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
exports.fecthBoardForSocket = exports.deleteBoard = exports.updateBoard = exports.getAllBoards = exports.addBoard = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const index_1 = require("../../index");
exports.addBoard = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, slug, description, members, workspace } = req.body;
    const owner = req.user._id;
    const newBoard = yield models_1.BoardModel.create({
        name,
        slug,
        description,
        members,
        owner,
        workspace,
    });
    // Create the columns
    const columnNames = ["To Do", "Review", "Done"];
    const columnPromises = columnNames.map((name) => models_1.ColumnModel.create({ name, owner, board: newBoard._id }));
    const columns = yield Promise.all(columnPromises);
    // Get the column IDs
    const columnIds = columns.map((column) => column._id);
    // Update the board with the column IDs
    newBoard.columns = columnIds;
    yield newBoard.save();
    // Update the workspace with the new board ID
    yield models_1.WorkspaceModel.findByIdAndUpdate(workspace, {
        $push: { boards: newBoard._id },
    });
    // Populate the board details
    const populatedBoard = yield models_1.BoardModel.findById(newBoard._id)
        .populate("owner", "full_name username avatar")
        .populate("members", "full_name username avatar")
        .populate("columns");
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, populatedBoard, "Board Added Successfully", utils_1.ResponseStatus.SUCCESS));
}));
exports.getAllBoards = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const boards = yield models_1.BoardModel.find()
        .populate("owner", "username full_name")
        .populate("members", "username full_name")
        .populate("workspace", "name");
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, boards, "Boards fetched successfully", utils_1.ResponseStatus.SUCCESS));
}));
exports.updateBoard = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedBoard = yield models_1.BoardModel.findByIdAndUpdate(id, req.body, {
        new: true,
    })
        .populate("owner", "username full_name")
        .populate("members", "username full_name");
    if (!updatedBoard) {
        throw new utils_1.AppError("Board not found", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedBoard, "Board Updated", utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteBoard = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedBoard = yield models_1.BoardModel.findOneAndDelete({ _id: id });
    yield models_1.WorkspaceModel.findByIdAndUpdate(deletedBoard.workspace, {
        $pull: { boards: id },
    });
    if (!deletedBoard) {
        throw new utils_1.AppError("No Board found with that ID", 400);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, null, "Board Deleted", utils_1.ResponseStatus.SUCCESS));
}));
exports.fecthBoardForSocket = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const boardId = req.body.socket_board;
    const userId = req.user._id;
    const board = yield models_1.BoardModel.findById(boardId).populate([
        { path: "owner", select: "full_name username avatar" },
        { path: "members", select: "full_name username avatar" },
        {
            path: "columns",
            populate: {
                path: "tasks",
                populate: [
                    { path: "assignedTo", select: "full_name username avatar" },
                    { path: "owner", select: "full_name username avatar" },
                ],
            },
        },
    ]);
    // Collect all recipient IDs (owner + members), and exclude the current user
    const filterRecipientIds = [
        board.owner._id.toString(),
        ...board.members.map((member) => member._id.toString()),
    ].filter((id) => id !== userId.toString()); // Exclude the user who made the request
    // Send the board data via socket to each recipient except the current user
    filterRecipientIds.forEach((recipientId) => {
        const receiverSocketId = (0, index_1.getReceiverSocketId)(recipientId); // Fetch socket ID of the user
        if (receiverSocketId) {
            index_1.io.to(receiverSocketId).emit("receiveSocketBoard", {
                boardId: board._id,
                workSpaceId: board.workspace,
                boardData: board, // Send the whole populated board data
            });
        }
    });
}));
//# sourceMappingURL=boardsController.js.map