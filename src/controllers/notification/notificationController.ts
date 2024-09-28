import { NotificationModel } from "../../models/notification/notificationModel";
import { AppResponse, catchAsync, ResponseStatus } from "../../utils";

// Get notifications for the logged-in user
export const getNotifications = catchAsync(async (req: any, res: any) => {
  const notifications = await NotificationModel.find({
    receiver: { $in: [req.user._id] },
  })
    .populate("sender", "full_name avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new AppResponse(200, notifications, "", ResponseStatus.SUCCESS));
});

// Create a new notification
export const createNotification = catchAsync(async (req: any, res: any) => {
  const { receiver, message, message_type } = req.body;
  const sender = req.user._id;

  const notification = await NotificationModel.create({
    message,
    message_type,
    receiver,
    sender,
  });

  // Populate the necessary fields
  const populatedNotification = await NotificationModel.findById(
    notification._id
  )
    .populate("sender", "full_name avatar")
    .populate("receiver", "full_name avatar");

  res
    .status(201)
    .json(
      new AppResponse(
        201,
        populatedNotification,
        "Notification created successfully",
        ResponseStatus.SUCCESS
      )
    );
});

// Mark a notification as read
export const markNotificationAsRead = catchAsync(async (req: any, res: any) => {
  const { id } = req.params;

  const notification = await NotificationModel.findByIdAndUpdate(
    id,
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res
      .status(404)
      .json(
        new AppResponse(
          404,
          null,
          "Notification not found",
          ResponseStatus.FAIL
        )
      );
  }

  res
    .status(200)
    .json(
      new AppResponse(
        200,
        notification,
        "Notification marked as read",
        ResponseStatus.SUCCESS
      )
    );
});
