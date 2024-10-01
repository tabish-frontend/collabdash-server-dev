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
// export const createMeeting = catchAsync(async (req: any, res: any) => {
//   const { title, time, participants } = req.body;
//   const owner = req.user;
//   const newMeeting = await MeetingModel.create({
//     title,
//     time,
//     participants,
//     owner: owner._id,
//   });
//   const populatedMeetings = await MeetingModel.findById(newMeeting._id)
//     .populate("owner", "full_name username avatar")
//     .populate("participants", "full_name username avatar time_zone");
//   let notificationMessage = `invited you in a ${title} meeting at ${time}`;
//   const receiver = participants.map((item: any) => item._id);
//   const newNotification = await NotificationModel.create({
//     sender: owner._id,
//     receiver,
//     message: notificationMessage,
//     link: title,
//     time: time,
//     target_link: `/meetings`,
//   });
//   const populatedNotification = await NotificationModel.findById(
//     newNotification._id
//   ).populate("sender", "full_name avatar");
//   receiver.forEach((recipientId: string) => {
//     const receiverSocketId = getReceiverSocketId(recipientId);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit(
//         "receiveNotification",
//         populatedNotification
//       );
//     }
//   });
//   const subscriptions = await PushSubscriptionModel.find({
//     user: { $in: participants },
//   });
//   // Iterate through all subscriptions for each participant
//   populatedMeetings.participants.forEach(async (participant: any) => {
//     // Get all subscriptions for the current participant
//     const userSubscriptions = subscriptions.filter((sub) =>
//       sub.user.equals(participant._id)
//     );
//     // Check if the participant and their time_zone exist
//     if (
//       !participant ||
//       !participant.time_zone ||
//       !participant.time_zone.value
//     ) {
//       console.error(
//         `Time zone not found for participant ID: ${participant._id}`
//       );
//       return; // Skip this iteration if time_zone is not available
//     }
//     const timeZone = participant.time_zone.value;
//     // Convert the UTC time to the participant's time zone
//     const utcTime = DateTime.fromISO(time);
//     const localTime = utcTime.setZone(timeZone);
//     // Format the time as needed
//     const formatTime = localTime.toFormat("MMM dd EEEE, hh:mm a");
//     const pushNotificationMessage = `${owner.full_name} invited you to a ${title} meeting at ${formatTime}`;
//     // Prepare the payload for the push notification
//     const payload = JSON.stringify({
//       title: `Task Update: ${title}`,
//       message: pushNotificationMessage,
//       icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg",
//       url: `/meetings`,
//     });
//     // Send notification to all subscriptions for the participant
//     for (const subscription of userSubscriptions) {
//       try {
//         await webPush.sendNotification(subscription, payload);
//         console.log(
//           `Push notification sent to subscription: ${subscription._id}`
//         );
//       } catch (error: any) {
//         console.error("Error sending push notification:", error);
//       }
//     }
//   });
//   return res
//     .status(201)
//     .json(
//       new AppResponse(
//         201,
//         populatedMeetings,
//         "Meeting Created Successfully",
//         ResponseStatus.SUCCESS
//       )
//     );
// });
let fromScheduler = false;
exports.createMeeting = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, time, participants } = req.body;
    const owner = req.user;
    const meetingTime = new Date(time);
    const newMeeting = yield models_1.MeetingModel.create({
        title,
        time: meetingTime,
        participants,
        owner: owner._id,
    });
    const populatedMeetings = yield models_1.MeetingModel.findById(newMeeting._id)
        .populate("owner", "full_name username avatar")
        .populate("participants", "full_name username avatar time_zone");
    const message = "";
    // Instant notification
    yield sendNotification(owner, participants, title, meetingTime, populatedMeetings, fromScheduler, message);
    // Schedule notifications
    scheduleNotifications(newMeeting._id, meetingTime, participants);
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, populatedMeetings, "Meeting Created Successfully", utils_1.ResponseStatus.SUCCESS));
}));
function sendNotification(owner, participants, title, time, populatedMeetings, fromScheduler, message) {
    return __awaiter(this, void 0, void 0, function* () {
        let notificationMessage = `invited you in a ${title} meeting at ${time}`;
        const schedulerMessage = `Meeting Reminder: ${title} \n${message}`;
        const receiver = participants.map((item) => item._id);
        const newNotification = yield models_1.NotificationModel.create({
            sender: owner._id,
            receiver,
            message: fromScheduler ? schedulerMessage : notificationMessage,
            link: title,
            time: time,
            target_link: `/meetings`,
            hide_sender_name: fromScheduler ? true : false,
        });
        const populatedNotification = yield models_1.NotificationModel.findById(newNotification._id).populate("sender", "full_name avatar");
        // Send socket notifications
        receiver.forEach((recipientId) => {
            const receiverSocketId = (0, index_1.getReceiverSocketId)(recipientId);
            if (receiverSocketId) {
                index_1.io.to(receiverSocketId).emit("receiveNotification", populatedNotification);
            }
        });
        yield sendPushNotifications(owner, participants, title, time, populatedMeetings, fromScheduler, message);
        // Send push notifications
    });
}
function sendPushNotifications(owner, participants, title, time, populatedMeetings, fromScheduler, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const subscriptions = yield models_1.PushSubscriptionModel.find({
            user: { $in: participants },
        });
        populatedMeetings.participants.forEach((participant) => __awaiter(this, void 0, void 0, function* () {
            const userSubscriptions = subscriptions.filter((sub) => sub.user.equals(participant._id));
            if (!participant ||
                !participant.time_zone ||
                !participant.time_zone.value) {
                console.error(`Time zone not found for participant ID: ${participant._id}`);
                return;
            }
            const timeZone = participant.time_zone.value;
            const localTime = luxon_1.DateTime.fromJSDate(time).setZone(timeZone);
            const formatTime = localTime.toFormat("MMM dd EEEE, hh:mm a");
            const pushNotificationMessage = `${owner.full_name} invited you to a ${title} meeting at ${formatTime}`;
            let payload;
            if (!fromScheduler) {
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
            for (const subscription of userSubscriptions) {
                try {
                    yield webPushConfig_1.default.sendNotification(subscription, payload);
                }
                catch (error) {
                    console.error("Error sending push notification:", error);
                }
            }
        }));
    });
}
function scheduleNotifications(meetingId, meetingTime, participants) {
    const meetingDateTime = luxon_1.DateTime.fromJSDate(meetingTime);
    const now = luxon_1.DateTime.now();
    const timeDiff = meetingDateTime.diff(now, "minutes").minutes;
    if (timeDiff > 60) {
        // Schedule 1 hour before
        const oneHourBefore = meetingDateTime.minus({ hours: 1 });
        scheduleNotification(meetingId, oneHourBefore.toJSDate(), participants, "Your meeting will start in 1 hour.");
    }
    if (timeDiff > 15) {
        // Schedule 15 minutes before
        const fifteenMinutesBefore = meetingDateTime.minus({ minutes: 15 });
        scheduleNotification(meetingId, fifteenMinutesBefore.toJSDate(), participants, "Your meeting will start in 15 minutes.");
    }
    // Always schedule at meeting time
    scheduleNotification(meetingId, meetingTime, participants, "Your meeting is now started.");
}
function scheduleNotification(meetingId, notificationTime, participants, message) {
    const cronDateTime = luxon_1.DateTime.fromJSDate(notificationTime);
    const cronExpression = `${cronDateTime.minute} ${cronDateTime.hour} ${cronDateTime.day} ${cronDateTime.month} *`;
    const task = node_cron_1.default.schedule(cronExpression, () => __awaiter(this, void 0, void 0, function* () {
        const meeting = yield models_1.MeetingModel.findById(meetingId)
            .populate("owner", "full_name username avatar")
            .populate("participants", "full_name username avatar time_zone");
        if (!meeting) {
            console.error(`Meeting not found for ID: ${meetingId}`);
            return;
        }
        fromScheduler = true;
        yield sendNotification(meeting.owner, participants, meeting.title, meeting.time, meeting, fromScheduler, message);
        task.stop();
    }));
}
exports.getAllMeetings = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.query;
    const userId = req.user._id;
    let filter = {};
    // Get the current time and subtract 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    // Determine filter based on the status
    if (status === "upcoming") {
        // Set filter to get meetings that are scheduled after two hours ago, i.e., upcoming
        filter = { time: { $gte: twoHoursAgo } };
    }
    else if (status === "completed") {
        // Get the current time and subtract 2 hours
        filter = { time: { $lt: twoHoursAgo } };
    }
    // Add condition to check if the user is the owner or a participant
    filter = Object.assign(Object.assign({}, filter), { $or: [
            { owner: userId },
            { participants: userId }, // Check if the user is a participant
        ] });
    // Find meetings with the updated filter and populate references
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
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, null, "Meeting Deleted Successfully", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=meetingController.js.map