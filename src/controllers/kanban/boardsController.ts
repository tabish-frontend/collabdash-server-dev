import { BoardModel, WorkspaceModel } from "../../models";
import { AppError, AppResponse, ResponseStatus, catchAsync } from "../../utils";

export const addBoard = catchAsync(async (req: any, res: any) => {
  const { name, description, members, workspace } = req.body;

  const owner = req.user._id;
  const slug = name.trim().toLowerCase().replace(/\s+/g, "_");

  const newBoard = await BoardModel.create({
    name,
    slug,
    description,
    members,
    owner,
    workspace,
  });

  await WorkspaceModel.findByIdAndUpdate(workspace, {
    $push: { boards: newBoard._id },
  });

  const populatedBoard = await BoardModel.findById(newBoard._id)
    .populate("owner", "full_name username avatar")
    .populate("members", "full_name username avatar");

  return res
    .status(201)
    .json(
      new AppResponse(
        201,
        populatedBoard,
        "Board Added Successfully",
        ResponseStatus.SUCCESS
      )
    );
});

export const getAllBoards = catchAsync(async (req: any, res: any) => {
  const boards = await BoardModel.find()
    .populate("owner", "username full_name")
    .populate("members", "username full_name")
    .populate("workspace", "name");

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        boards,
        "Boards fetched successfully",
        ResponseStatus.SUCCESS
      )
    );
});

export const updateBoard = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;

  const updatedBoard = await BoardModel.findByIdAndUpdate(id, req.body, {
    new: true,
  })
    .populate("owner", "username full_name")
    .populate("members", "username full_name")
    .populate("workspace", "name");

  if (!updatedBoard) {
    throw new AppError("Board not found", 404);
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        updatedBoard,
        "Board Updated",
        ResponseStatus.SUCCESS
      )
    );
});

export const deleteBoard = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedBoard = await BoardModel.findByIdAndDelete(id);

  await WorkspaceModel.findByIdAndUpdate(deletedBoard.workspace, {
    $pull: { boards: id },
  });

  if (!deletedBoard) {
    throw new AppError("No Board found with that ID", 400);
  }

  return res
    .status(200)
    .json(new AppResponse(200, null, "Board Deleted", ResponseStatus.SUCCESS));
});
