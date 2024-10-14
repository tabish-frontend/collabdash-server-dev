import { WorkspaceModel } from "../../models";
import { AppResponse, ResponseStatus, catchAsync } from "../../utils";
import { Roles } from "../../types/enum";

export const getAllWorkspaces = catchAsync(async (req, res) => {
  let workspacesQuery;

  if (req.user.role === Roles.Admin) {
    workspacesQuery = WorkspaceModel.find();
  } else {
    workspacesQuery = WorkspaceModel.find({
      $or: [{ members: req.user._id }, { owner: req.user._id }],
    });
  }

  const workspaces = await workspacesQuery
    .populate("owner", "full_name username avatar")
    .populate("members", "full_name username avatar")
    .populate({
      path: "boards",
      match:
        req.user.role === Roles.Admin
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
    .json(new AppResponse(200, workspaces, "", ResponseStatus.SUCCESS));
});

export const addWorkspace = catchAsync(async (req: any, res: any, next) => {
  const { name, slug, members } = req.body;

  const owner = req.user._id;

  const newWorkSpace = await WorkspaceModel.create({
    name,
    slug,
    owner,
    members,
  });

  const populatedWorkSpace = await WorkspaceModel.findById(newWorkSpace._id)
    .populate("owner", "full_name username avatar")
    .populate("members", "full_name username avatar");

  req.socket_workspace_id = newWorkSpace._id;

  next();

  return res
    .status(201)
    .json(
      new AppResponse(
        201,
        populatedWorkSpace,
        "WorkSpace Added Successfully",
        ResponseStatus.SUCCESS
      )
    );
});

export const updateWorkspace = catchAsync(async (req: any, res, next) => {
  const { id } = req.params;

  const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
    }
  )
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
      .json(
        new AppResponse(404, null, "Workspace not found", ResponseStatus.ERROR)
      );
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        updatedWorkspace,
        "Workspace Updated",
        ResponseStatus.SUCCESS
      )
    );
});

export const deleteWorkSpace = catchAsync(async (req: any, res, next) => {
  const { id } = req.params;

  const deletedWorkspace = await WorkspaceModel.findOneAndDelete({ _id: id });

  if (!deletedWorkspace) {
    return res
      .status(404)
      .json(
        new AppResponse(404, null, "Workspace not found", ResponseStatus.ERROR)
      );
  }

  req.socket_workspace_id = id;
  req.socket_deleted_workspace = deletedWorkspace;

  next();

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        deletedWorkspace,
        "Workspace and all related entities deleted successfully",
        ResponseStatus.SUCCESS
      )
    );
});
