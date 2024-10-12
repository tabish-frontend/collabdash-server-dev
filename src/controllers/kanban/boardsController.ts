import { BoardModel, ColumnModel, WorkspaceModel } from "../../models";
import { AppError, AppResponse, ResponseStatus, catchAsync } from "../../utils";
import { io, getReceiverSocketId } from "../../index";

export const addBoard = catchAsync(async (req: any, res: any) => {
  const { name, slug, description, members, workspace } = req.body;

  const owner = req.user._id;

  const newBoard = await BoardModel.create({
    name,
    slug,
    description,
    members,
    owner,
    workspace,
  });

  // Create the columns
  const columnNames = ["To Do", "Review", "Done"];
  const columnPromises = columnNames.map((name) =>
    ColumnModel.create({ name, owner, board: newBoard._id })
  );
  const columns = await Promise.all(columnPromises);

  // Get the column IDs
  const columnIds = columns.map((column) => column._id);

  // Update the board with the column IDs
  newBoard.columns = columnIds;
  await newBoard.save();

  // Update the workspace with the new board ID
  await WorkspaceModel.findByIdAndUpdate(workspace, {
    $push: { boards: newBoard._id },
  });

  // Populate the board details
  const populatedBoard = await BoardModel.findById(newBoard._id)
    .populate("owner", "full_name username avatar")
    .populate("members", "full_name username avatar")
    .populate("columns");

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
    .populate("members", "username full_name");

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

  const deletedBoard = await BoardModel.findOneAndDelete({ _id: id });

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

export const fecthBoardForSocket = catchAsync(async (req, res) => {
  const boardId = req.body.socket_board;
  const userId = req.user._id;

  const board = await BoardModel.findById(boardId).populate([
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
    const receiverSocketId = getReceiverSocketId(recipientId); // Fetch socket ID of the user

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveSocketBoard", {
        boardId: board._id,
        workSpaceId: board.workspace,
        boardData: board, // Send the whole populated board data
      });
    }
  });
});
