import {
  MeetingModel,
  NotificationModel,
  PushSubscriptionModel,
} from "../models";
import { AppError, AppResponse, ResponseStatus, catchAsync } from "../utils";
import webPush from "../config/webPushConfig";
import { io, getReceiverSocketId } from "../index";
import { DateTime } from "luxon";
import cron from "node-cron";
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

export const createMeeting = catchAsync(async (req: any, res: any) => {
  const { title, time, participants } = req.body;
  const owner = req.user;
  const meetingTime = new Date(time);

  const newMeeting: any = await MeetingModel.create({
    title,
    time: meetingTime,
    participants,
    owner: owner._id,
  });

  const populatedMeetings = await MeetingModel.findById(newMeeting._id)
    .populate("owner", "full_name username avatar")
    .populate("participants", "full_name username avatar time_zone");

  const message = "";
  // Instant notification
  await sendNotification(
    owner,
    participants,
    title,
    meetingTime,
    populatedMeetings,
    fromScheduler,
    message
  );

  // Schedule notifications
  scheduleNotifications(newMeeting._id, meetingTime, participants);

  return res
    .status(201)
    .json(
      new AppResponse(
        201,
        populatedMeetings,
        "Meeting Created Successfully",
        ResponseStatus.SUCCESS
      )
    );
});

async function sendNotification(
  owner: any,
  participants: any[],
  title: string,
  time: Date,
  populatedMeetings: any,
  fromScheduler: any,
  message: any
) {
  let notificationMessage = `invited you in a ${title} meeting at ${time}`;
  const schedulerMessage = `Meeting Reminder: ${title} \n${message}`;
  const receiver = participants.map((item: any) => item._id);

  const newNotification = await NotificationModel.create({
    sender: owner._id,
    receiver,
    message: fromScheduler ? schedulerMessage : notificationMessage,
    link: title,
    time: time,
    target_link: `/meetings`,
    hide_sender_name: fromScheduler ? true : false,
  });

  const populatedNotification = await NotificationModel.findById(
    newNotification._id
  ).populate("sender", "full_name avatar");

  // Send socket notifications
  receiver.forEach((recipientId: string) => {
    const receiverSocketId = getReceiverSocketId(recipientId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "receiveNotification",
        populatedNotification
      );
    }
  });

  await sendPushNotifications(
    owner,
    participants,
    title,
    time,
    populatedMeetings,
    fromScheduler,
    message
  );

  // Send push notifications
}

async function sendPushNotifications(
  owner: any,
  participants: any[],
  title: string,
  time: Date,
  populatedMeetings: any,
  fromScheduler: any,
  message: any
) {
  const subscriptions = await PushSubscriptionModel.find({
    user: { $in: participants },
  });

  populatedMeetings.participants.forEach(async (participant: any) => {
    const userSubscriptions = subscriptions.filter((sub) =>
      sub.user.equals(participant._id)
    );

    if (
      !participant ||
      !participant.time_zone ||
      !participant.time_zone.value
    ) {
      console.error(
        `Time zone not found for participant ID: ${participant._id}`
      );
      return;
    }

    const timeZone = participant.time_zone.value;
    const localTime = DateTime.fromJSDate(time).setZone(timeZone);
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
    } else {
      payload = JSON.stringify({
        title: `Meeting Reminder: ${title}`,
        message: message,
        icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg",
        url: `/meetings`,
      });
    }

    for (const subscription of userSubscriptions) {
      try {
        await webPush.sendNotification(subscription, payload);
      } catch (error: any) {
        console.error("Error sending push notification:", error);
      }
    }
  });
}

function scheduleNotifications(
  meetingId: string,
  meetingTime: Date,
  participants: any[]
) {
  const meetingDateTime = DateTime.fromJSDate(meetingTime);
  const now = DateTime.now();

  const timeDiff = meetingDateTime.diff(now, "minutes").minutes;
  if (timeDiff > 60) {
    // Schedule 1 hour before
    const oneHourBefore = meetingDateTime.minus({ hours: 1 });
    scheduleNotification(
      meetingId,
      oneHourBefore.toJSDate(),
      participants,
      "Your meeting will start in 1 hour."
    );
  }

  if (timeDiff > 15) {
    // Schedule 15 minutes before
    const fifteenMinutesBefore = meetingDateTime.minus({ minutes: 15 });
    scheduleNotification(
      meetingId,
      fifteenMinutesBefore.toJSDate(),
      participants,
      "Your meeting will start in 15 minutes."
    );
  }

  // Always schedule at meeting time
  scheduleNotification(
    meetingId,
    meetingTime,
    participants,
    "Your meeting is now started."
  );
}

function scheduleNotification(
  meetingId: string,
  notificationTime: Date,
  participants: any[],
  message: string
) {
  const cronDateTime = DateTime.fromJSDate(notificationTime);
  const cronExpression = `${cronDateTime.minute} ${cronDateTime.hour} ${cronDateTime.day} ${cronDateTime.month} *`;

  const task = cron.schedule(cronExpression, async () => {
    const meeting = await MeetingModel.findById(meetingId)
      .populate("owner", "full_name username avatar")
      .populate("participants", "full_name username avatar time_zone");

    if (!meeting) {
      console.error(`Meeting not found for ID: ${meetingId}`);
      return;
    }
    fromScheduler = true;
    await sendNotification(
      meeting.owner,
      participants,
      meeting.title,
      meeting.time,
      meeting,
      fromScheduler,
      message
    );

    task.stop();
  });
}

export const getAllMeetings = catchAsync(async (req, res) => {
  const { status } = req.query;
  const userId = req.user._id;

  let filter = {};

  // Get the current time and subtract 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  // Determine filter based on the status
  if (status === "upcoming") {
    // Set filter to get meetings that are scheduled after two hours ago, i.e., upcoming

    filter = { time: { $gte: twoHoursAgo } };
  } else if (status === "completed") {
    // Get the current time and subtract 2 hours

    filter = { time: { $lt: twoHoursAgo } };
  }

  // Add condition to check if the user is the owner or a participant
  filter = {
    ...filter,
    $or: [
      { owner: userId }, // Check if the user is the owner
      { participants: userId }, // Check if the user is a participant
    ],
  };

  // Find meetings with the updated filter and populate references
  const meetings = await MeetingModel.find(filter)
    .populate("owner", "full_name username avatar")
    .populate("participants", "full_name username avatar")
    .sort({ time: status === "upcoming" ? 1 : -1 });

  return res
    .status(200)
    .json(new AppResponse(200, meetings, "", ResponseStatus.SUCCESS));
});

export const getMeeting = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Find the meeting by its _id and populate owner and participants
  const meetings = await MeetingModel.findById(id)
    .populate("owner", "full_name username avatar")
    .populate("participants", "full_name username avatar")
    .sort({ time: 1 });

  if (!meetings) {
    throw new AppError("", 409);
  }

  return res
    .status(200)
    .json(new AppResponse(200, meetings, "", ResponseStatus.SUCCESS));
});

export const updateMeeting = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  // Find the meeting by id and update with new data
  const updatedMeeting = await MeetingModel.findByIdAndUpdate(id, updatedData, {
    new: true, // Return the updated document
    runValidators: true, // Ensure validation rules are respected
  })
    .populate("owner", "full_name username avatar")
    .populate("participants", "full_name username avatar");

  // Check if meeting exists
  if (!updatedMeeting) {
    throw new AppError("Meeting not found", 404);
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        updatedMeeting,
        "Meeting Updated",
        ResponseStatus.SUCCESS
      )
    );
});

export const deleteMeeting = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Find the meeting by id and remove it
  const meeting = await MeetingModel.findByIdAndDelete(id);

  // Check if meeting exists
  if (!meeting) {
    throw new AppError("No Meeting found with that ID", 400);
  }
  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        null,
        "Meeting Deleted Successfully",
        ResponseStatus.SUCCESS
      )
    );
});
