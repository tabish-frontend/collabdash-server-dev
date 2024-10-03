import { NotificationModel, PushSubscriptionModel } from "../models";
import { getReceiverSocketId, io } from "../index";
import webPush from ".././config/webPushConfig";

// Function to send notifications without any cooldown
export const sendChatNotification = async (
  sender: any, // The user sending the message
  recipientIds: string[], // Array of user IDs to receive the notification
  targetLink: string // The link to relevant content (task, thread, etc.)
) => {
  // Notify all recipients
  for (const recipientId of recipientIds) {
    const notificationMessage =
      recipientIds.length > 1
        ? `has sent you a message in Group Chat`
        : `has sent you a message.`;

    const newNotification = await NotificationModel.create({
      sender: sender._id,
      receiver: recipientId,
      message: notificationMessage,
      link: `message`,
      target_link: targetLink,
    });

    // Populate sender details in the notification
    const populatedNotification = await NotificationModel.findById(
      newNotification._id
    ).populate("sender", "full_name avatar");

    // Emit the notification to the recipient's socket if they are online
    const receiverSocketId = getReceiverSocketId(recipientId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "receiveNotification",
        populatedNotification
      );
    }
    const subscriptions = await PushSubscriptionModel.find({
      user: recipientId,
    });

    // Create the push notification message
    const pushNotificationMessage = `${sender.full_name} ${notificationMessage}`;

    // Send push notification to all subscriptions of the recipient
    subscriptions.forEach(async (subscription: any) => {
      const payload = JSON.stringify({
        title: `New Message from ${sender.full_name}`,
        message: pushNotificationMessage,
        icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg", // Replace with your icon URL
        url: targetLink, // URL to navigate on notification click
      });

      try {
        await webPush.sendNotification(subscription, payload);
      } catch (error: any) {
        console.log("Error sending push notification:", error);
      }
    });
  }
};
