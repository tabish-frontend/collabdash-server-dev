import { ColumnModel, BoardModel } from "../../models";
import { AppError, AppResponse, ResponseStatus, catchAsync } from "../../utils";

export const addColumn = catchAsync(async (req: any, res: any) => {
  const { name, board } = req.body;

  const owner = req.user._id;

  const newColumn = await ColumnModel.create({
    name,
    owner,
    board,
  });

  await BoardModel.findByIdAndUpdate(board, {
    $push: { columns: newColumn._id },
  });

  const populatedColumn = await ColumnModel.findById(newColumn._id).populate(
    "tasks"
  );

  return res
    .status(201)
    .json(
      new AppResponse(
        201,
        populatedColumn,
        "Column created successfully",
        ResponseStatus.SUCCESS
      )
    );
});

export const updateColumn = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;
  const { name } = req.body;

  const updatedColumn = await ColumnModel.findByIdAndUpdate(
    id,
    { name },
    { new: true }
  ).populate("tasks");

  if (!updatedColumn) {
    throw new AppError("Column not found", 404);
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        updatedColumn,
        "Column Updated",
        ResponseStatus.SUCCESS
      )
    );
});

export const moveColumn = catchAsync(async (req: any, res: any) => {
  const { boardID } = req.params;
  const { column_id, index } = req.body;

  console.log("move boardID", boardID);

  // Find the board by ID
  const board = await BoardModel.findById(boardID);
  if (!board) {
    throw new AppError("Board not found", 404);
  }

  // Find the current index of the column
  const currentIndex = board.columns.indexOf(column_id);
  if (currentIndex === -1) {
    throw new AppError("Column not found in the board", 404);
  }

  // Remove the column from its current position
  board.columns.splice(currentIndex, 1);

  // Insert the column into the new position
  board.columns.splice(index, 0, column_id);

  // Save the updated board
  await board.save();

  const populatedBoard = await BoardModel.findById(boardID)
    .populate("owner", "full_name username avatar")
    .populate("members", "full_name username avatar")
    .populate({
      path: "columns",
      populate: {
        path: "tasks",
        model: "Task",
      },
    });

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        populatedBoard,
        "Column moved successfully",
        ResponseStatus.SUCCESS
      )
    );
});

export const deleteColumn = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedColumn = await ColumnModel.findByIdAndDelete(id);

  await BoardModel.findByIdAndUpdate(deletedColumn.board, {
    $pull: { columns: id },
  });

  if (!deletedColumn) {
    throw new AppError("No Column found with that ID", 400);
  }

  return res
    .status(200)
    .json(new AppResponse(200, null, "Column Deleted", ResponseStatus.SUCCESS));
});
