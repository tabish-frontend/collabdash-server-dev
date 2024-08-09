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

export const moveTask = catchAsync(async (req, res) => {
  const { task_id, column_id, index } = req.body;

  const task = await TaskModel.findById(task_id).orFail(
    () => new AppError("Task not found", 404)
  );

  if (column_id) {
    await ColumnModel.findByIdAndUpdate(task.column, {
      $pull: { tasks: task_id },
    });

    await ColumnModel.findByIdAndUpdate(column_id, {
      $push: { tasks: { $each: [task_id], $position: index } },
    });

    task.column = column_id;

    await task.save();
  } else {
    const column = await ColumnModel.findById(task.column).orFail(
      () => new AppError("Column not found", 404)
    );

    const currentIndex = column.tasks.indexOf(task_id);
    column.tasks.splice(currentIndex, 1);
    column.tasks.splice(index, 0, task_id);

    await column.save();
  }

  const populatedTask = await TaskModel.findById(task_id)
    .populate("board", "name")
    .populate("column", "name")
    .populate("assignedTo", "full_name username");

  return res
    .status(200)
    .json(
      new AppResponse(200, populatedTask, "Task moved", ResponseStatus.SUCCESS)
    );
});
