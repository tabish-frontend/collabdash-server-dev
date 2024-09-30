// controllers/subscriptionController.ts
import { Request, Response } from "express";
import webPush from "../../config/webPushConfig"; // Import web-push configuration
import { PushSubscriptionModel } from "../../models"; // Import your PushSubscription model
import { catchAsync } from "../../utils";

// Controller for saving subscription
export const subscribe = catchAsync(async (req: any, res: any) => {
  //   res.status(204).send();
  const subscription = req.body;
  const userId = req.user._id; // Assuming user ID is stored in req.user

  // Check if the subscription already exists
  const existingSubscription = await PushSubscriptionModel.findOne({
    endpoint: subscription.endpoint,
  });

  if (existingSubscription) {
    return res.status(200).json({ message: "" });
  }

  // Create a new subscription record
  const newSubscription = new PushSubscriptionModel({
    user: userId, // Include user ID
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });

  try {
    await newSubscription.save();
    res.status(201).json({ message: "" });
  } catch (error) {
    // console.error("Error saving subscription:", error);
    // res.sendStatus(500);
  }
});

// Controller for sending push notification
export const sendNotification = catchAsync(async (req: any, res: any) => {
  const notificationPayload = {
    title: req.body.title,
    body: req.body.body,
  };

  // Retrieve all subscriptions from the database
  const subscriptions = await PushSubscriptionModel.find();

  const promises = subscriptions.map((subscription) =>
    webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify(notificationPayload)
    )
  );

  try {
    await Promise.all(promises);
    res.status(200).json({ message: "Notification sent." });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.sendStatus(500);
  }
});
export const removeSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user._id; // Get the user ID from the request

    if (!userId) {
      return res.status(400).json({ message: "User Id is required." });
    }

    // Remove all subscriptions for this user
    const result = await PushSubscriptionModel.deleteMany({ user: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "" });
    }

    res.status(200).json({ message: "" });
  }
);
