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
exports.deleteMeeting = exports.updateMeeting = exports.getMeeting = exports.getAllMeetings = exports.createMeeting = void 0;
const models_1 = require("../models");
const utils_1 = require("../utils");
const webPushConfig_1 = __importDefault(require("../config/webPushConfig"));
const index_1 = require("../index");
const luxon_1 = require("luxon");
const node_cron_1 = __importDefault(require("node-cron"));
const scheduledTasks = {}; // Map to store scheduled tasks
function sendAppNotification(meeting, isReminder = false, message = "") {
    return __awaiter(this, void 0, void 0, function* () {
        const { participants, title, time, owner } = meeting;
        const notificationMessage = `invited you in a ${title} meeting at ${time}`;
        const schedulerMessage = `Meeting Reminder: ${title} \n${message}`;
        const receiver = participants.map((item) => item._id);
        const newNotification = yield models_1.NotificationModel.create({
            sender: owner._id,
            receiver,
            message: isReminder ? schedulerMessage : notificationMessage,
            link: title,
            time: time,
            target_link: `/meetings`,
            hide_sender_name: isReminder,
        });
        receiver.forEach((recipientId) => {
            const receiverSocketId = (0, index_1.getReceiverSocketId)(recipientId);
            if (receiverSocketId) {
                index_1.io.to(receiverSocketId).emit("receiveNotification", newNotification);
            }
        });
    });
}
function sendPushNotifications(meeting, isReminder = false, message = "") {
    return __awaiter(this, void 0, void 0, function* () {
        const { participants, title, time, owner } = meeting;
        participants.forEach((participant) => __awaiter(this, void 0, void 0, function* () {
            const subscribeUser = yield models_1.PushSubscriptionModel.find({
                user: { $in: participant },
            });
            let timeZone = "UTC+00:00";
            if (participant.time_zone) {
                timeZone = participant.time_zone.value;
            }
            const localTime = luxon_1.DateTime.fromJSDate(time).setZone(timeZone);
            const formatTime = localTime.toFormat("MMM dd EEEE, hh:mm a");
            const pushNotificationMessage = `${owner.full_name} invited you to a ${title} meeting at ${formatTime}`;
            let payload;
            if (!isReminder) {
                payload = JSON.stringify({
                    title: `Meeting Invitation: ${title}`,
                    message: pushNotificationMessage,
                    icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg",
                    url: `/meetings`,
                });
            }
            else {
                payload = JSON.stringify({
                    title: `Meeting Reminder: ${title}`,
                    message: message,
                    icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg",
                    url: `/meetings`,
                });
            }
            for (const subscription of subscribeUser) {
                try {
                    yield webPushConfig_1.default.sendNotification(subscription, payload);
                }
                catch (error) {
                    console.error("Error sending push notification:", error);
                    // Check for status code 410 (Gone)
                    if (error.statusCode === 410) {
                        // Remove expired subscription from database
                        yield models_1.PushSubscriptionModel.deleteOne({
                            _id: subscription._id,
                        });
                        console.log(`Removed expired subscription: ${subscription.endpoint}`);
                    }
                }
            }
        }));
    });
}
function scheduleNotificationTask(time, meeting, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const cronDateTime = luxon_1.DateTime.fromJSDate(time);
        const cronExpression = `${cronDateTime.minute} ${cronDateTime.hour} ${cronDateTime.day} ${cronDateTime.month} *`;
        const task = node_cron_1.default.schedule(cronExpression, () => __awaiter(this, void 0, void 0, function* () {
            console.log(`Executing task for meeting ID: ${meeting._id} at ${new Date()}`);
            yield sendAppNotification(meeting, true, message);
            yield sendPushNotifications(meeting, true, message);
            task.stop();
        }));
        // Log when task is scheduled
        console.log(`Scheduled task for meeting ID: ${meeting._id} at ${time}`);
        // Store the task in the map
        if (!scheduledTasks[meeting._id]) {
            scheduledTasks[meeting._id] = [];
        }
        scheduledTasks[meeting._id].push(task);
    });
}
function scheduleNotifications(meeting) {
    return __awaiter(this, void 0, void 0, function* () {
        const { time } = meeting;
        const meetingDateTime = luxon_1.DateTime.fromJSDate(new Date(time));
        // Schedule for 1 hour before the meeting
        const oneHourBefore = meetingDateTime.minus({ hours: 1 }).toJSDate();
        scheduleNotificationTask(oneHourBefore, meeting, "Your meeting will start in 1 hour.");
        // Schedule for 15 minutes before the meeting
        const fifteenMinutesBefore = meetingDateTime
            .minus({ minutes: 15 })
            .toJSDate();
        scheduleNotificationTask(fifteenMinutesBefore, meeting, "Your meeting will start in 15 minutes.");
        // Schedule for the meeting start time
        scheduleNotificationTask(new Date(time), meeting, "Your meeting is now starting.");
    });
}
exports.createMeeting = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, time, participants, recurring, meeting_days } = req.body;
    const owner = req.user;
    const newMeeting = yield models_1.MeetingModel.create({
        title,
        time,
        participants,
        recurring,
        meeting_days: recurring ? meeting_days : [],
        owner: owner._id,
    });
    if (participants.length) {
        yield sendAppNotification(newMeeting);
        yield sendPushNotifications(newMeeting);
        yield scheduleNotifications(newMeeting); // Schedule notifications
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, newMeeting, "Meeting Created", utils_1.ResponseStatus.SUCCESS));
}));
exports.getAllMeetings = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.query;
    const userId = req.user._id;
    // Get the current time and subtract 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    // Base filter to check if the user is the owner or a participant
    const baseFilter = {
        $or: [
            { owner: userId },
            { participants: userId }, // Check if the user is a participant
        ],
    };
    let filter = Object.assign({}, baseFilter);
    if (status === "upcoming") {
        // Filter for upcoming meetings
        filter = Object.assign(Object.assign({}, baseFilter), { $and: [
                {
                    $or: [
                        { time: { $gte: twoHoursAgo } },
                        { recurring: true }, // Recurring meetings, always include
                    ],
                },
            ] });
    }
    else if (status === "completed") {
        // Filter for completed meetings
        filter = Object.assign(Object.assign({}, baseFilter), { $and: [
                { time: { $lt: twoHoursAgo } },
                { recurring: false }, // Exclude recurring meetings from completed
            ] });
    }
    const meetings = yield models_1.MeetingModel.find(filter)
        .populate("owner", "full_name username avatar")
        .populate("participants", "full_name username avatar")
        .sort({ time: status === "upcoming" ? 1 : -1 });
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, meetings, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.getMeeting = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Find the meeting by its _id and populate owner and participants
    const meetings = yield models_1.MeetingModel.findById(id)
        .populate("owner", "full_name username avatar")
        .populate("participants", "full_name username avatar")
        .sort({ time: 1 });
    if (!meetings) {
        throw new utils_1.AppError("", 409);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, meetings, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.updateMeeting = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedData = req.body;
    // Find the meeting by id and update with new data
    const updatedMeeting = yield models_1.MeetingModel.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true, // Ensure validation rules are respected
    })
        .populate("owner", "full_name username avatar")
        .populate("participants", "full_name username avatar");
    // Check if meeting exists
    if (!updatedMeeting) {
        throw new utils_1.AppError("Meeting not found", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedMeeting, "Meeting Updated", utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteMeeting = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Find the meeting by id and remove it
    const meeting = yield models_1.MeetingModel.findByIdAndDelete(id);
    // Check if meeting exists
    if (!meeting) {
        throw new utils_1.AppError("No Meeting found with that ID", 400);
    }
    console.log("scheduledTasks", scheduledTasks[id]);
    // Stop and remove all scheduled tasks for this meeting
    if (scheduledTasks[id]) {
        console.log(`Stopping tasks for meeting ID: ${id}`);
        scheduledTasks[id].forEach((task) => {
            console.log(`Stopped task for meeting ID: ${id}`);
            task.stop();
        }); // Stop each task
        delete scheduledTasks[id]; // Remove from the map
        console.log(`Deleted all tasks for meeting ID: ${id}`);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, null, "Meeting Deleted Successfully", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=meetingController.js.map