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
exports.emitToWorkspaceMembers = exports.emitToBoardMembers = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const index_1 = require("../../index");
const emitToBoardMembers = (eventName) => {
    return (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const boardId = req.socket_board;
        const deletedBoard = req.socket_deleted_board;
        const userId = req.user._id;
        // Fetch the board details, selecting only the owner and members
        const board = eventName.includes("deleted")
            ? deletedBoard
            : yield models_1.BoardModel.findById(boardId).select("owner members");
        // Fetch all users with the "admin" role
        const admins = yield models_1.UserModel.find({ role: "admin" }).select("_id");
        const adminIds = admins.map((admin) => admin._id.toString());
        // Create an array of all board members and the board owner
        let allRecipients = [
            board.owner.toString(),
            ...adminIds,
            ...board.members.map((member) => member.toString()),
        ];
        // Remove duplicates by converting to a Set, then back to an array
        allRecipients = [...new Set(allRecipients)];
        // Filter out the current user from the list of recipients
        const filterRecipientIds = allRecipients.filter((id) => id !== userId.toString());
        // Emit the event to all filtered members
        filterRecipientIds.forEach((member) => {
            const receiverSocketId = (0, index_1.getReceiverSocketId)(member); // Fetch socket ID of the user
            if (receiverSocketId) {
                index_1.io.to(receiverSocketId).emit(eventName);
            }
        });
    }));
};
exports.emitToBoardMembers = emitToBoardMembers;
const emitToWorkspaceMembers = (eventName) => {
    return (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const workspaceId = req.socket_workspace_id;
        const deletedWorkSpace = req.socket_deleted_workspace;
        const userId = req.user._id;
        // Fetch the board details, selecting only the owner and members
        const workspace = eventName.includes("deleted")
            ? deletedWorkSpace
            : yield models_1.WorkspaceModel.findById(workspaceId).select("owner members");
        // Fetch all users with the "admin" role
        const admins = yield models_1.UserModel.find({ role: "admin" }).select("_id");
        const adminIds = admins.map((admin) => admin._id.toString());
        // Create an array of all board members and the board owner
        let allRecipients = [
            workspace.owner.toString(),
            ...adminIds,
            ...workspace.members.map((member) => member.toString()),
        ];
        // Remove duplicates by converting to a Set, then back to an array
        allRecipients = [...new Set(allRecipients)];
        // Filter out the current user from the list of recipients
        const filterRecipientIds = allRecipients.filter((id) => id !== userId.toString());
        // Emit the event to all filtered members
        filterRecipientIds.forEach((member) => {
            const receiverSocketId = (0, index_1.getReceiverSocketId)(member); // Fetch socket ID of the user
            if (receiverSocketId) {
                index_1.io.to(receiverSocketId).emit(eventName);
            }
        });
    }));
};
exports.emitToWorkspaceMembers = emitToWorkspaceMembers;
//# sourceMappingURL=KanbanMiddleware.js.map