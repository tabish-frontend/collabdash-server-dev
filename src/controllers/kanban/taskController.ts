import {
  ColumnModel,
  BoardModel,
  TaskModel,
  NotificationModel,
} from "../../models";
import {
  AppError,
  AppResponse,
  ResponseStatus,
  catchAsync,
  deleteFromCloudinary,
  isFilesObject,
  uploadOnCloudinary,
} from "../../utils";
import { PushSubscriptionModel } from "../../models";
import webPush from "../../config/webPushConfig";
import { io, getReceiverSocketId } from "../../index";

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
  const currentBoard = await BoardModel.findByIdAndUpdate(board, {
    $push: { tasks: newTask._id },
    new: true,
  });

  // Populate the necessary fields
  const populatedTask = await TaskModel.findById(newTask._id)
    .populate("owner", "full_name username avatar")
    .populate("assignedTo", "full_name username avatar");

  const filterRecipientIds = currentBoard.members
    .map((member) => member._id.toString())
    .filter((id) => id !== owner.toString()); // Exclude the user who made the request

  filterRecipientIds.forEach((member: any) => {
    const receiverSocketId = getReceiverSocketId(member); // Fetch socket ID of the user

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("task created");
    }
  });

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
  const userId = req.user._id;

  const deletedTask = await TaskModel.findByIdAndDelete(id);

  if (!deletedTask) {
    return res
      .status(404)
      .json(new AppResponse(404, null, "Task not found", ResponseStatus.ERROR));
  }

  await ColumnModel.findByIdAndUpdate(deletedTask.column, {
    $pull: { tasks: id },
  });

  const currentBoard = await BoardModel.findByIdAndUpdate(deletedTask.board, {
    $pull: { tasks: id },
    new: true,
  });

  const filterRecipientIds = currentBoard.members
    .map((member) => member._id.toString())
    .filter((id) => id !== userId.toString()); // Exclude the user who made the request

  filterRecipientIds.forEach((member: any) => {
    const receiverSocketId = getReceiverSocketId(member); // Fetch socket ID of the user

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("task deleted");
    }
  });

  return res
    .status(200)
    .json(new AppResponse(200, null, "Task Deleted", ResponseStatus.SUCCESS));
});

export const moveTask = catchAsync(async (req, res) => {
  const { task_id, column_id, index, target_link } = req.body;
  const user = req.user;

  const task: any = await TaskModel.findById(task_id).orFail(
    () => new AppError("Task not found", 404)
  );

  if (column_id) {
    const previousColumn = await ColumnModel.findByIdAndUpdate(task.column, {
      $pull: { tasks: task_id },
    });

    const newColumn = await ColumnModel.findByIdAndUpdate(column_id, {
      $push: { tasks: { $each: [task_id], $position: index } },
    });

    const isOwner = user._id.toString() === task.owner.toString();

    const remainingAssignees = task.assignedTo.filter(
      (item: any) => item.toString() !== user._id.toString()
    );

    const receiver = isOwner
      ? task.assignedTo
      : [...remainingAssignees, task.owner];

    const notificationMessage = `has moved Task ${task.title} from ${previousColumn.name} to ${newColumn.name} `;

    const newNotification = await NotificationModel.create({
      sender: user._id,
      receiver: receiver,
      message: notificationMessage,
      link: task.title,
      target_link,
    });

    const subscriptions = await PushSubscriptionModel.find({
      user: { $in: receiver },
    });

    receiver.forEach((recipientId: string) => {
      const receiverSocketId = getReceiverSocketId(recipientId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveNotification", newNotification);
      }
    });
    const pushNotificationMessage = `${user.full_name} ${notificationMessage}`;

    // Send push notification
    subscriptions.forEach(async (subscription: any) => {
      const payload = JSON.stringify({
        title: `Task Update: ${task.title}`,
        message: pushNotificationMessage,
        icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg", // Path to your notification icon
        url: target_link, // URL to navigate on notification click
      });

      try {
        await webPush.sendNotification(subscription, payload);
      } catch (error: any) {
        console.log("error", error);
      }
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

  const populatedTask: any = await TaskModel.findById(task_id)
    .populate("board", "name members")
    .populate("column", "name")
    .populate("assignedTo", "full_name username");

  const filterRecipientIds = populatedTask.board.members
    .map((member: any) => member._id.toString())
    .filter((id: any) => id !== user._id.toString()); // Exclude the user who made the request

  filterRecipientIds.forEach((member: any) => {
    const receiverSocketId = getReceiverSocketId(member); // Fetch socket ID of the user

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("task moved");
    }
  });

  return res
    .status(200)
    .json(
      new AppResponse(200, populatedTask, "Task moved", ResponseStatus.SUCCESS)
    );
});

export const uploadAttachment = catchAsync(async (req, res) => {
  let attachment = "";
  if (isFilesObject(req.files)) {
    const file = await uploadOnCloudinary(req.files.attachment[0].path);

    attachment = file.url;
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        attachment,
        "Attachment Uploaded",
        ResponseStatus.SUCCESS
      )
    );
});

export const deleteAttachment = catchAsync(async (req, res) => {
  const { id } = req.params;

  await deleteFromCloudinary(id);

  return res
    .status(200)
    .json(
      new AppResponse(200, null, "Attachment Deleted", ResponseStatus.SUCCESS)
    );
});

export const updateTask = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;

  const { owner, assignedTo, title, target_link } = req.body;
  const existingTask = await TaskModel.findById(id).populate("assignedTo");

  if (!existingTask) {
    throw new AppError("Task not found", 404);
  }

  const receiver = assignedTo.map((item: any) => item._id);

  let notificationMessage = `has assigned you a Task ${title}`;

  const updatedTask: any = await TaskModel.findByIdAndUpdate(id, req.body, {
    new: true,
  })
    .populate("owner", "username full_name avatar")
    .populate("assignedTo", "username full_name avatar")
    .populate("board");

  if (!updatedTask) {
    throw new AppError("Board not found", 404);
  }

  const filterRecipientIds = updatedTask.board.members
    .map((member: any) => member._id.toString())
    .filter((id: any) => id !== owner.toString()); // Exclude the user who made the request

  filterRecipientIds.forEach((member: any) => {
    const receiverSocketId = getReceiverSocketId(member); // Fetch socket ID of the user

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("task updated");
    }
  });

  // if (assignedTo.length) {
  const previousAssignedIds = existingTask.assignedTo.map((item: any) =>
    item._id.toString()
  );
  const newlyAssignedUsers = receiver.filter(
    (recipientId: string) => !previousAssignedIds.includes(recipientId)
  );

  if (newlyAssignedUsers.length === 0) {
    notificationMessage = `has made some changes in Task ${title}`;
  }
  const newNotification = await NotificationModel.create({
    sender: owner._id,
    receiver,
    message: notificationMessage,
    link: title,
    target_link,
  });

  const subscriptions = await PushSubscriptionModel.find({
    user: { $in: receiver },
  });

  receiver.forEach((recipientId: string) => {
    const receiverSocketId = getReceiverSocketId(recipientId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveNotification", newNotification);
    }
  });

  const pushNotificationMessage = `${owner.full_name} ${notificationMessage}`;

  subscriptions.forEach(async (subscription: any) => {
    const payload = JSON.stringify({
      title: `Task Update: ${title}`,
      message: pushNotificationMessage,
      icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg", // Path to your notification icon
      url: target_link, // URL to navigate on notification click
    });

    try {
      await webPush.sendNotification(subscription, payload);
    } catch (error: any) {}
  });

  return res
    .status(200)
    .json(
      new AppResponse(200, updatedTask, "Task Updated", ResponseStatus.SUCCESS)
    );
});
