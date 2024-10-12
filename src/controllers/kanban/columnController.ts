import { ColumnModel, BoardModel, TaskModel } from "../../models";
import { AppError, AppResponse, ResponseStatus, catchAsync } from "../../utils";

export const addColumn = catchAsync(async (req: any, res: any, next) => {
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

  req.body.socket_board = board;

  next();

  return res
    .status(201)
    .json(
      new AppResponse(
        201,
        populatedColumn,
        "Column created",
        ResponseStatus.SUCCESS
      )
    );
});

export const updateColumn = catchAsync(async (req: any, res: any, next) => {
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

  req.body.socket_board = updatedColumn.board;

  next();

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

export const moveColumn = catchAsync(async (req: any, res: any, next) => {
  const { board_id, column_id, index } = req.body;

  // Find the board by ID
  const board = await BoardModel.findById(board_id);
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

  req.body.socket_board = board_id;

  next();

  return res
    .status(200)
    .json(new AppResponse(200, {}, "Column moved", ResponseStatus.SUCCESS));
});

export const clearAnddeleteColumn = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { type } = req.query;

  const column = await ColumnModel.findById(id);

  if (!column) {
    throw new AppError("No Column found with that ID", 400);
  }

  // Step 1: Delete all tasks related to the column
  await TaskModel.deleteMany({ _id: { $in: column.tasks } });

  // Step 2: Remove task IDs from BoardModel and ColumnModel

  await ColumnModel.findByIdAndUpdate(id, {
    $set: { tasks: [] },
  });

  await BoardModel.findByIdAndUpdate(column.board, {
    $pull: { tasks: { $in: column.tasks } },
  });

  // Step 3: If the type is "delete", remove the column ID from BoardModel and delete the column
  if (type === "delete") {
    await ColumnModel.findByIdAndDelete(id);

    await BoardModel.findByIdAndUpdate(column.board, {
      $pull: { columns: id },
    });
  }

  req.body.socket_board = column.board;

  next();

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        null,
        type === "delete" ? "Column deleted" : "Column  cleared",
        ResponseStatus.SUCCESS
      )
    );
});
