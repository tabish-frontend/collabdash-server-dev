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

async function sendAppNotification(
  meeting: any,
  isReminder: boolean = false,
  message: string = ""
) {
  const { participants, title, time, owner } = meeting;

  const notificationMessage = `invited you in a ${title} meeting at ${time}`;
  const schedulerMessage = `Meeting Reminder: ${title} \n${message}`;
  const receiver = participants.map((item: any) => item._id);

  const newNotification = await NotificationModel.create({
    sender: owner._id,
    receiver,
    message: isReminder ? schedulerMessage : notificationMessage,
    link: title,
    time: time,
    target_link: `/meetings`,
    hide_sender_name: isReminder,
  });

  receiver.forEach((recipientId: string) => {
    const receiverSocketId = getReceiverSocketId(recipientId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveNotification", newNotification);
    }
  });
}

async function sendPushNotifications(
  meeting: any,
  isReminder: boolean = false,
  message: string = ""
) {
  const { participants, title, time, owner } = meeting;

  const subscribeUser = await PushSubscriptionModel.find({
    user: { $in: participants },
  });

  participants.forEach(async (participant: any) => {
    let timeZone = "UTC+00:00";

    if (participant.time_zone) {
      timeZone = participant.time_zone.value;
    }

    const localTime = DateTime.fromJSDate(time).setZone(timeZone);
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
    } else {
      payload = JSON.stringify({
        title: `Meeting Reminder: ${title}`,
        message: message,
        icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg",
        url: `/meetings`,
      });
    }

    for (const subscription of subscribeUser) {
      try {
        await webPush.sendNotification(subscription, payload);
      } catch (error: any) {
        console.error("Error sending push notification:", error);
      }
    }
  });
}

async function scheduleNotificationTask(
  time: Date,
  meeting: any,
  message: string
) {
  const cronDateTime = DateTime.fromJSDate(time);
  const cronExpression = `${cronDateTime.minute} ${cronDateTime.hour} ${cronDateTime.day} ${cronDateTime.month} *`;

  const task = cron.schedule(cronExpression, async () => {
    await sendAppNotification(meeting, true, message);
    await sendPushNotifications(meeting, true, message);

    task.stop();
  });
}

async function scheduleNotifications(meeting: any) {
  const { time } = meeting;

  const meetingDateTime = DateTime.fromJSDate(new Date(time));

  // Schedule for 1 hour before the meeting
  const oneHourBefore = meetingDateTime.minus({ hours: 1 }).toJSDate();
  scheduleNotificationTask(
    oneHourBefore,
    meeting,
    "Your meeting will start in 1 hour."
  );

  // Schedule for 15 minutes before the meeting
  const fifteenMinutesBefore = meetingDateTime
    .minus({ minutes: 15 })
    .toJSDate();
  scheduleNotificationTask(
    fifteenMinutesBefore,
    meeting,
    "Your meeting will start in 15 minutes."
  );

  // Schedule for the meeting start time
  scheduleNotificationTask(
    new Date(time),
    meeting,
    "Your meeting is now starting."
  );
}

export const createMeeting = catchAsync(async (req: any, res: any) => {
  const { title, time, participants, recurring, meeting_days } = req.body;
  const owner = req.user;

  const newMeeting: any = await MeetingModel.create({
    title,
    time,
    participants,
    recurring,
    meeting_days: recurring ? meeting_days : [],
    owner: owner._id,
  });

  if (participants.length) {
    await sendAppNotification(newMeeting);
    await sendPushNotifications(newMeeting);
    await scheduleNotifications(newMeeting); // Schedule notifications
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        newMeeting,
        "Meeting Created Successfully",
        ResponseStatus.SUCCESS
      )
    );
});

export const getAllMeetings = catchAsync(async (req, res) => {
  const { status } = req.query;
  const userId = req.user._id;

  // Get the current time and subtract 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  let meetings: any[] = [];

  // Base filter to check if the user is the owner or a participant
  const baseFilter = {
    $or: [
      { owner: userId }, // Check if the user is the owner
      { participants: userId }, // Check if the user is a participant
    ],
  };

  if (status === "upcoming") {
    // Query for regular upcoming meetings (time >= twoHoursAgo)
    const upcomingMeetings = await MeetingModel.find({
      ...baseFilter,
      time: { $gte: twoHoursAgo },
    })
      .populate("owner", "full_name username avatar")
      .populate("participants", "full_name username avatar")
      .sort({ time: 1 });

    // Query for recurring meetings (regardless of time)
    const recurringMeetings = await MeetingModel.find({
      ...baseFilter,
      recurring: true,
    })
      .populate("owner", "full_name username avatar")
      .populate("participants", "full_name username avatar")
      .sort({ time: 1 });

    // Combine both results
    meetings = [...upcomingMeetings, ...recurringMeetings];
  } else if (status === "completed") {
    // Query for completed non-recurring meetings (time < twoHoursAgo)
    meetings = await MeetingModel.find({
      ...baseFilter,
      time: { $lt: twoHoursAgo },
      recurring: false,
    })
      .populate("owner", "full_name username avatar")
      .populate("participants", "full_name username avatar")
      .sort({ time: -1 });
  }

  return res
    .status(200)
    .json(new AppResponse(200, meetings, "", ResponseStatus.SUCCESS));
});

// export const getAllMeetings = catchAsync(async (req, res) => {
//   const { status } = req.query;
//   const userId = req.user._id;

//   let filter = {};

//   // Get the current time and subtract 2 hours
//   const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

//   // Determine filter based on the status
//   if (status === "upcoming") {
//     // Set filter to get meetings that are either upcoming (time >= twoHoursAgo) or recurring
//     filter = { time: { $gte: twoHoursAgo } };
//   } else if (status === "completed") {
//     // Only non-recurring meetings that are completed (time < twoHoursAgo)

//     filter = { time: { $lt: twoHoursAgo } };
//   }

//   // Add condition to check if the user is the owner or a participant
//   filter = {
//     ...filter,
//     $or: [
//       { owner: userId }, // Check if the user is the owner
//       { participants: userId }, // Check if the user is a participant
//     ],
//   };

//   // Find meetings with the updated filter and populate references
//   const meetings = await MeetingModel.find(filter)
//     .populate("owner", "full_name username avatar")
//     .populate("participants", "full_name username avatar")
//     .sort({ time: status === "upcoming" ? 1 : -1 });

//   return res
//     .status(200)
//     .json(new AppResponse(200, meetings, "", ResponseStatus.SUCCESS));
// });

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
