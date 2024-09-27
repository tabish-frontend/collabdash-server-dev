"use strict";
// // routes/subscriptionRoutes.ts
// import express, { Request, Response } from "express";
// import webPush from "../../webPushConfig"; // Import web-push configuration
// import { PushSubscriptionModel } from "../../models"; // Import your PushSubscription model
Object.defineProperty(exports, "__esModule", { value: true });
// const router = express.Router();
// // Endpoint to save subscription
// router.post("/subscribe", async (req: Request, res: Response) => {
//   const subscription = req.body;
//   const userId = req.user._id;
//   // Check if the subscription already exists
//   const existingSubscription = await PushSubscriptionModel.findOne({
//     endpoint: subscription.endpoint,
//   });
//   if (existingSubscription) {
//     return res.status(200).json({ message: "Subscription already exists." });
//   }
//   // Create a new subscription record
//   const newSubscription = new PushSubscriptionModel({
//     user: userId, // Include user ID if needed
//     endpoint: subscription.endpoint,
//     keys: {
//       p256dh: subscription.keys.p256dh,
//       auth: subscription.keys.auth,
//     },
//   });
//   try {
//     await newSubscription.save();
//     res.status(201).json({ message: "Subscription added." });
//   } catch (error) {
//     console.error("Error saving subscription:", error);
//     res.sendStatus(500);
//   }
// });
// // Endpoint to send a push notification
// router.post("/send-notification", async (req: Request, res: Response) => {
//   const notificationPayload = {
//     title: req.body.title,
//     body: req.body.body,
//   };
//   // Retrieve all subscriptions from the database
//   const subscriptions = await PushSubscriptionModel.find();
//   const promises = subscriptions.map((subscription) =>
//     webPush.sendNotification(
//       {
//         endpoint: subscription.endpoint,
//         keys: {
//           p256dh: subscription.keys.p256dh,
//           auth: subscription.keys.auth,
//         },
//       },
//       JSON.stringify(notificationPayload)
//     )
//   );
//   try {
//     await Promise.all(promises);
//     res.status(200).json({ message: "Notification sent." });
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     res.sendStatus(500);
//   }
// });
// export default router;
const express_1 = require("express");
const controllers_1 = require("../../controllers");
const middlewares_1 = require("../../middlewares");
const router = (0, express_1.Router)();
// PROTECTED ROUTES
router.use(middlewares_1.Protect);
router.post("/subscribe", controllers_1.subscribe);
router.post("/remove", controllers_1.removeSubscription);
// Create a new notification
router.post("/send-notification", controllers_1.sendNotification);
// Mark notification as read
exports.default = router;
//# sourceMappingURL=subscriptionRoutes.js.map