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
