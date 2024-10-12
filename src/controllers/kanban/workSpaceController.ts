import { WorkspaceModel } from "../../models";
import { AppResponse, ResponseStatus, catchAsync } from "../../utils";
import { io, getReceiverSocketId } from "../../index";

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

  const filterRecipientIds = populatedWorkSpace.members
    .map((member: any) => member._id.toString())
    .filter((id: any) => id !== owner.toString()); // Exclude the user who made the request

  filterRecipientIds.forEach((member: any) => {
    const receiverSocketId = getReceiverSocketId(member); // Fetch socket ID of the user

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("workSpace created");
    }
  });

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
  const workspaces = await WorkspaceModel.find({
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
    .json(new AppResponse(200, workspaces, "", ResponseStatus.SUCCESS));
});

export const updateWorkspace = catchAsync(async (req, res) => {
  const userId = req.user._id;
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

  const filterRecipientIds = updatedWorkspace.members
    .map((member: any) => member._id.toString())
    .filter((id: any) => id !== userId.toString()); // Exclude the user who made the request

  filterRecipientIds.forEach((member: any) => {
    const receiverSocketId = getReceiverSocketId(member); // Fetch socket ID of the user

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("workSpace updated");
    }
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
  const userId = req.user._id;
  const { id } = req.params;

  const currentWorkSpace = await WorkspaceModel.findById(id);
  // Trigger the middleware by using `findOneAndDelete`
  const deletedWorkspace = await WorkspaceModel.findOneAndDelete({ _id: id });

  if (!deletedWorkspace) {
    return res
      .status(404)
      .json(
        new AppResponse(404, null, "Workspace not found", ResponseStatus.ERROR)
      );
  }

  const filterRecipientIds = currentWorkSpace.members
    .map((member: any) => member._id.toString())
    .filter((id: any) => id !== userId.toString()); // Exclude the user who made the request

  filterRecipientIds.forEach((member: any) => {
    const receiverSocketId = getReceiverSocketId(member); // Fetch socket ID of the user

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("workSpace deleted");
    }
  });

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
