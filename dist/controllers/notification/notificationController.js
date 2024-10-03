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
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationAsRead = exports.createNotification = exports.getNotifications = void 0;
const notificationModel_1 = require("../../models/notification/notificationModel");
const utils_1 = require("../../utils");
// Get notifications for the logged-in user
exports.getNotifications = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notifications = yield notificationModel_1.NotificationModel.find({
        receiver: { $in: [req.user._id] },
    })
        .populate("sender", "full_name avatar")
        .sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, notifications, "", utils_1.ResponseStatus.SUCCESS));
}));
// Create a new notification
exports.createNotification = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiver, message, message_type } = req.body;
    const sender = req.user._id;
    const newNotification = yield notificationModel_1.NotificationModel.create({
        message,
        message_type,
        receiver,
        sender,
    });
    res
        .status(201)
        .json(new utils_1.AppResponse(201, newNotification, "Notification created successfully", utils_1.ResponseStatus.SUCCESS));
}));
// Mark a notification as read
exports.markNotificationAsRead = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const notification = yield notificationModel_1.NotificationModel.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) {
        return res
            .status(404)
            .json(new utils_1.AppResponse(404, null, "Notification not found", utils_1.ResponseStatus.FAIL));
    }
    res
        .status(200)
        .json(new utils_1.AppResponse(200, notification, "Notification marked as read", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=notificationController.js.map