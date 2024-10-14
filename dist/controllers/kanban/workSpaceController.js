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
exports.deleteWorkSpace = exports.updateWorkspace = exports.addWorkspace = exports.getAllWorkspaces = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const enum_1 = require("../../types/enum");
exports.getAllWorkspaces = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let workspacesQuery;
    if (req.user.role === enum_1.Roles.Admin) {
        workspacesQuery = models_1.WorkspaceModel.find();
    }
    else {
        workspacesQuery = models_1.WorkspaceModel.find({
            $or: [{ members: req.user._id }, { owner: req.user._id }],
        });
    }
    const workspaces = yield workspacesQuery
        .populate("owner", "full_name username avatar")
        .populate("members", "full_name username avatar")
        .populate({
        path: "boards",
        match: req.user.role === enum_1.Roles.Admin
            ? {}
            : { $or: [{ members: req.user._id }, { owner: req.user._id }] },
        populate: [
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
        ],
    });
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, workspaces, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.addWorkspace = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, slug, members } = req.body;
    const owner = req.user._id;
    const newWorkSpace = yield models_1.WorkspaceModel.create({
        name,
        slug,
        owner,
        members,
    });
    const populatedWorkSpace = yield models_1.WorkspaceModel.findById(newWorkSpace._id)
        .populate("owner", "full_name username avatar")
        .populate("members", "full_name username avatar");
    req.socket_workspace_id = newWorkSpace._id;
    next();
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, populatedWorkSpace, "WorkSpace Added Successfully", utils_1.ResponseStatus.SUCCESS));
}));
exports.updateWorkspace = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedWorkspace = yield models_1.WorkspaceModel.findByIdAndUpdate(id, req.body, {
        new: true,
    })
        .populate("owner", "full_name username avatar")
        .populate("members", "full_name username avatar")
        .populate({
        path: "boards",
        populate: [
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
        ],
    });
    req.socket_workspace_id = id;
    next();
    if (!updatedWorkspace) {
        return res
            .status(404)
            .json(new utils_1.AppResponse(404, null, "Workspace not found", utils_1.ResponseStatus.ERROR));
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedWorkspace, "Workspace Updated", utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteWorkSpace = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedWorkspace = yield models_1.WorkspaceModel.findOneAndDelete({ _id: id });
    if (!deletedWorkspace) {
        return res
            .status(404)
            .json(new utils_1.AppResponse(404, null, "Workspace not found", utils_1.ResponseStatus.ERROR));
    }
    req.socket_workspace_id = id;
    req.socket_deleted_workspace = deletedWorkspace;
    next();
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, deletedWorkspace, "Workspace and all related entities deleted successfully", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=workSpaceController.js.map