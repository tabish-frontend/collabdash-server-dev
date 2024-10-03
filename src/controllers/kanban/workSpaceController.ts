import { Roles } from "../../types/enum";
import { WorkspaceModel } from "../../models";
import { AppResponse, ResponseStatus, catchAsync } from "../../utils";

export const addWorkspace = catchAsync(async (req: any, res: any) => {
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

export const getAllWorkspaces = catchAsync(async (req, res) => {
  let workspacesQuery;

  // If user is Admin or HR, retrieve all workspaces; otherwise, filter by user membership
  if (req.user.role === Roles.Employee) {
    workspacesQuery = WorkspaceModel.find({ members: req.user._id });
  } else {
    workspacesQuery = WorkspaceModel.find(); // Fetch all workspaces
  }

  const workspaces = await workspacesQuery
    .populate("owner", "full_name username avatar")
    .populate("members", "full_name username avatar")
    .populate({
      path: "boards",
      match:
        req.user.role === Roles.Employee
          ? { members: req.user._id } // Filter boards by user membership
          : {}, // No filtering on boards for Admin or HR
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

export const updateWorkspace = catchAsync(async (req, res) => {
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

export const deleteWorkSpace = catchAsync(async (req, res) => {
  const { id } = req.params;
  // Trigger the middleware by using `findOneAndDelete`
  const deletedWorkspace = await WorkspaceModel.findOneAndDelete({ _id: id });

  if (!deletedWorkspace) {
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
        deletedWorkspace,
        "Workspace and all related entities deleted successfully",
        ResponseStatus.SUCCESS
      )
    );
});
