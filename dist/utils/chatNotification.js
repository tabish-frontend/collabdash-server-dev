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
threadId, recipientIds, // Array of user IDs to receive the notification
contentType) => __awaiter(void 0, void 0, void 0, function* () {
    // Notify all recipients
    for (const recipientId of recipientIds) {
        let notificationMessage = "";
        let generateLink = "";
        let targetLink = "";
        // /chat?threadKey=${thread._id}
        // Check if the content type is "call"
        if (contentType === "call") {
            notificationMessage =
                recipientIds.length > 1
                    ? "starting a video call in Group Chat click here to join"
                    : "starting a video call in Chat click here to join";
            generateLink = "click here to join";
            targetLink = `/chat/room?threadKey=${threadId}`;
        }
        else {
            notificationMessage =
                recipientIds.length > 1
                    ? "has sent you a message in Group Chat"
                    : "has sent you a message.";
            generateLink = "message";
            targetLink = `/chat?threadKey=${threadId}`;
        }
        const newNotification = yield models_1.NotificationModel.create({
            sender: sender._id,
            receiver: recipientId,
            message: notificationMessage,
            link: generateLink,
            target_link: targetLink,
        });
        // Emit the notification to the recipient's socket if they are online
        const receiverSocketId = (0, index_1.getReceiverSocketId)(recipientId);
        if (receiverSocketId) {
            index_1.io.to(receiverSocketId).emit("receiveNotification", newNotification);
        }
        const subscribeUser = yield models_1.PushSubscriptionModel.find({
            user: recipientId,
        });
        // Create the push notification message
        const pushNotificationMessage = `${sender.full_name} ${notificationMessage}`;
        const payload = JSON.stringify({
            title: `New Message from ${sender.full_name}`,
            message: pushNotificationMessage,
            icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg",
            url: targetLink,
        });
        for (const subscription of subscribeUser) {
            try {
                yield webPushConfig_1.default.sendNotification(subscription, payload);
            }
            catch (error) {
                console.error("Error sending push notification:", error);
            }
        }
    }
});
exports.sendChatNotification = sendChatNotification;
//# sourceMappingURL=chatNotification.js.map