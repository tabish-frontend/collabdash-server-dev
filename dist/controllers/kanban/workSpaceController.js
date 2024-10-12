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
exports.deleteWorkSpace = exports.updateWorkspace = exports.getAllWorkspaces = exports.addWorkspace = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
exports.addWorkspace = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, populatedWorkSpace, "WorkSpace Added Successfully", utils_1.ResponseStatus.SUCCESS));
}));
exports.getAllWorkspaces = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workspaces = yield models_1.WorkspaceModel.find({
        $or: [{ members: req.user._id }, { owner: req.user._id }],
    })
        .populate("owner", "full_name username avatar")
        .populate("members", "full_name username avatar")
        .populate({
        path: "boards",
        match: {
            $or: [{ members: req.user._id }, { owner: req.user._id }],
        },
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
exports.updateWorkspace = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (!updatedWorkspace) {
        return res
            .status(404)
            .json(new utils_1.AppResponse(404, null, "Workspace not found", utils_1.ResponseStatus.ERROR));
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedWorkspace, "Workspace Updated", utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteWorkSpace = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Trigger the middleware by using `findOneAndDelete`
    const deletedWorkspace = yield models_1.WorkspaceModel.findOneAndDelete({ _id: id });
    if (!deletedWorkspace) {
        return res
            .status(404)
            .json(new utils_1.AppResponse(404, null, "Workspace not found", utils_1.ResponseStatus.ERROR));
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, deletedWorkspace, "Workspace and all related entities deleted successfully", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=workSpaceController.js.map