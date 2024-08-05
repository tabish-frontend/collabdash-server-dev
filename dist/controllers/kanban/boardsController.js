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
exports.deleteBoard = exports.updateBoard = exports.getAllBoards = exports.addBoard = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
exports.addBoard = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, members, workspace } = req.body;
    const owner = req.user._id;
    const slug = name.trim().toLowerCase().replace(/\s+/g, "_");
    const newBoard = yield models_1.BoardModel.create({
        name,
        slug,
        description,
        members,
        owner,
        workspace,
    });
    yield models_1.WorkspaceModel.findByIdAndUpdate(workspace, {
        $push: { boards: newBoard._id },
    });
    const populatedBoard = yield models_1.BoardModel.findById(newBoard._id)
        .populate("owner", "full_name username avatar")
        .populate("members", "full_name username avatar");
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
        .populate("members", "username full_name")
        .populate("workspace", "name");
    if (!updatedBoard) {
        throw new utils_1.AppError("Board not found", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedBoard, "Board Updated", utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteBoard = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedBoard = yield models_1.BoardModel.findByIdAndDelete(id);
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
//# sourceMappingURL=boardsController.js.map