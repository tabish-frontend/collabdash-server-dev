"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendChatNotification = void 0;
const models_1 = require("../models");
const index_1 = require("../index");
const webPushConfig_1 = __importDefault(require(".././config/webPushConfig"));
// Function to send notifications without any cooldown
const sendChatNotification = (sender, // The user sending the message
recipientIds, // Array of user IDs to receive the notification
targetLink, // The link to relevant content (task, thread, etc.)
threadId // The thread ID for the chat (to track notifications)
) => __awaiter(void 0, void 0, void 0, function* () {
    // Notify all recipients
    for (const recipientId of recipientIds) {
        if (recipientId === sender._id.toString()) {
            // Skip the sender (don't notify the sender about their own message)
            continue;
        }
        // Create the notification message dynamically
        const notificationMessage = `has sent you a message.`;
        // Create the notification in the database
        const newNotification = yield models_1.NotificationModel.create({
            sender: sender._id,
            receiver: recipientId,
            message: notificationMessage,
            link: `message`,
            target_link: targetLink,
            threadId, // Save threadId to track notifications within this chat
        });
        // Populate sender details in the notification
        const populatedNotification = yield models_1.NotificationModel.findById(newNotification._id).populate("sender", "full_name avatar");
        // Emit the notification to the recipient's socket if they are online
        const receiverSocketId = (0, index_1.getReceiverSocketId)(recipientId);
        if (receiverSocketId) {
            index_1.io.to(receiverSocketId).emit("receiveNotification", populatedNotification);
        }
        const subscriptions = yield models_1.PushSubscriptionModel.find({
            user: recipientId,
        });
        // Create the push notification message
        const pushNotificationMessage = `${sender.full_name} ${notificationMessage}`;
        // Send push notification to all subscriptions of the recipient
        subscriptions.forEach((subscription) => __awaiter(void 0, void 0, void 0, function* () {
            const payload = JSON.stringify({
                title: `New Message from ${sender.full_name}`,
                message: pushNotificationMessage,
                icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg",
                url: targetLink, // URL to navigate on notification click
            });
            try {
                yield webPushConfig_1.default.sendNotification(subscription, payload);
            }
            catch (error) {
                console.log("Error sending push notification:", error);
            }
        }));
    }
});
exports.sendChatNotification = sendChatNotification;
//# sourceMappingURL=chatNotification.js.map