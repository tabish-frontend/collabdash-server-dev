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
exports.removeSubscription = exports.sendNotification = exports.subscribe = void 0;
const webPushConfig_1 = __importDefault(require("../../webPushConfig")); // Import web-push configuration
const models_1 = require("../../models"); // Import your PushSubscription model
const utils_1 = require("../../utils");
// Controller for saving subscription
exports.subscribe = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //   res.status(204).send();
    const subscription = req.body;
    const userId = req.user._id; // Assuming user ID is stored in req.user
    // Check if the subscription already exists
    const existingSubscription = yield models_1.PushSubscriptionModel.findOne({
        endpoint: subscription.endpoint,
    });
    if (existingSubscription) {
        return res.status(200).json({ message: "Subscription already exists." });
    }
    // Create a new subscription record
    const newSubscription = new models_1.PushSubscriptionModel({
        user: userId,
        endpoint: subscription.endpoint,
        keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        },
    });
    try {
        yield newSubscription.save();
        res.status(201).json({ message: "Subscription added." });
    }
    catch (error) {
        // console.error("Error saving subscription:", error);
        // res.sendStatus(500);
    }
}));
// Controller for sending push notification
exports.sendNotification = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notificationPayload = {
        title: req.body.title,
        body: req.body.body,
    };
    // Retrieve all subscriptions from the database
    const subscriptions = yield models_1.PushSubscriptionModel.find();
    const promises = subscriptions.map((subscription) => webPushConfig_1.default.sendNotification({
        endpoint: subscription.endpoint,
        keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        },
    }, JSON.stringify(notificationPayload)));
    try {
        yield Promise.all(promises);
        res.status(200).json({ message: "Notification sent." });
    }
    catch (error) {
        console.error("Error sending notification:", error);
        res.sendStatus(500);
    }
}));
exports.removeSubscription = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id; // Get the user ID from the request
    if (!userId) {
        return res.status(400).json({ message: "User Id is required." });
    }
    // Remove all subscriptions for this user
    const result = yield models_1.PushSubscriptionModel.deleteMany({ user: userId });
    if (result.deletedCount === 0) {
        return res
            .status(404)
            .json({ message: "No subscriptions found for this user." });
    }
    res
        .status(200)
        .json({ message: "All subscriptions removed successfully." });
}));
//# sourceMappingURL=subscriptionController.js.map