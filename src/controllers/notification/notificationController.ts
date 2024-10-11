import { NotificationModel } from "../../models/notification/notificationModel";
import { AppResponse, catchAsync, ResponseStatus } from "../../utils";

// Get notifications for the logged-in user
export const getNotifications = catchAsync(async (req: any, res: any) => {
  const notifications = await NotificationModel.find({
    receiver: { $elemMatch: { user: req.user._id } }, // Find notifications where user is in the receiver array
  })
    .populate("sender", "full_name avatar")
    .sort({ createdAt: -1 });

  // Transform notifications to include user._id outside the receiver array
  const formattedNotifications = notifications.map((notification: any) => {
    // Find the receiver entry for the requesting user
    const receiverEntry = notification.receiver.find(
      (rec: any) => rec.user.toString() === req.user._id.toString()
    );

    return {
      _id: notification._id,
      sender: notification.sender,
      message: notification.message,
      link: notification.link,
      time: notification.time,
      target_link: notification.target_link,
      hide_sender_name: notification.hide_sender_name,
      read: receiverEntry ? receiverEntry.read : false, // Add read status based on receiver
      createdAt: notification.createdAt,
    };
  });

  return res
    .status(200)
    .json(
      new AppResponse(200, formattedNotifications, "", ResponseStatus.SUCCESS)
    );
});

// Create a new notification
export const createNotification = catchAsync(async (req: any, res: any) => {
  const { receiver, message, message_type } = req.body;
  const sender = req.user._id;

  const newNotification = await NotificationModel.create({
    message,
    message_type,
    receiver,
    sender,
  });

  res
    .status(201)
    .json(
      new AppResponse(
        201,
        newNotification,
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
