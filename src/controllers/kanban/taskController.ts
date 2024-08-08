import { ColumnModel, BoardModel, TaskModel } from "../../models";
import { AppError, AppResponse, ResponseStatus, catchAsync } from "../../utils";

export const addTask = catchAsync(async (req: any, res: any) => {
  const { title, board, column } = req.body;
  const owner = req.user._id;

  // Create the new task
  const newTask = await TaskModel.create({
    title,
    board,
    column,
    owner,
  });

  // Add the new task to the column
  await ColumnModel.findByIdAndUpdate(column, {
    $push: { tasks: newTask._id },
  });

  // Add the new task to the board
  await BoardModel.findByIdAndUpdate(board, {
    $push: { tasks: newTask._id },
  });

  // Populate the necessary fields
  const populatedTask = await TaskModel.findById(newTask._id)
    .populate("owner", "full_name username avatar")
    .populate("assignedTo", "full_name username avatar");

  return res
    .status(201)
    .json(
      new AppResponse(
        201,
        populatedTask,
        "Task created",
        ResponseStatus.SUCCESS
      )
    );
});

export const deleteTask = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedTask = await TaskModel.findByIdAndDelete(id);

  if (!deletedTask) {
    return res
      .status(404)
      .json(new AppResponse(404, null, "Task not found", ResponseStatus.ERROR));
  }

  await ColumnModel.findByIdAndUpdate(deletedTask.column, {
    $pull: { tasks: id },
  });

  await BoardModel.findByIdAndUpdate(deletedTask.board, {
    $pull: { tasks: id },
  });

  return res
    .status(200)
    .json(new AppResponse(200, null, "Task Deleted", ResponseStatus.SUCCESS));
});
