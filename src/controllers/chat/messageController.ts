import { MessageModel, ThreadModel, UserModel } from "../../models";
import {
  AppError,
  AppResponse,
  catchAsync,
  ChatType,
  ResponseStatus,
} from "../../utils";
import { io, getReceiverSocketId } from "../../index"; // Adjust the path based on your project structure
import { sendChatNotification } from "../../utils";

export const getThreads = catchAsync(async (req: any, res: any) => {
  const userId = req.user._id;

  // Find threads where the current user is a participant
  const threads = await ThreadModel.find({ participants: { $in: [userId] } })
    .populate("participants", "full_name avatar")
    .populate("messages");

  return res
    .status(201)
    .json(new AppResponse(201, threads, "", ResponseStatus.SUCCESS));
});

export const getThreadByKey = catchAsync(async (req: any, res: any) => {
  const { threadkey } = req.params;
  const { populate } = req.query; // Extract the 'populate' query parameter
  const userId = req.user.id;

  if (!threadkey) {
    throw new AppError("Thread ID is required", 400);
  }

  // Create an empty array to hold population conditions
  const populateFields: any[] = [];

  // Dynamically add fields to populate based on the query parameter
  if (populate) {
    const fieldsToPopulate = populate.split(",");

    if (fieldsToPopulate.includes("participants")) {
      populateFields.push({
        path: "participants",
        select: "full_name avatar",
      });
    }

    if (fieldsToPopulate.includes("messages")) {
      populateFields.push("messages"); // If messages need to be populated
    }
  }

  // Perform the initial search by threadkey
  let thread = await ThreadModel.findById(threadkey).populate(populateFields);

  // If no thread is found by threadkey, attempt to find by participants
  if (!thread) {
    thread = await ThreadModel.findOne({
      participants: { $all: [userId, threadkey] },
      $expr: { $eq: [{ $size: "$participants" }, 2] }, // Ensure it's a one-on-one chat (exactly 2 participants)
    }).populate(populateFields);
  }

  if (!thread) {
    return res
      .status(200)
      .json(new AppResponse(200, null, "", ResponseStatus.FAIL));
  }

  // Return the thread with the dynamically populated fields
  return res
    .status(200)
    .json(new AppResponse(200, thread, "", ResponseStatus.SUCCESS));
});

export const getParticipitantsByThreadKey = catchAsync(
  async (req: any, res: any) => {
    const { threadkey } = req.params;

    // Check if the thread exists
    const thread = await ThreadModel.findById(threadkey)
      .populate("participants")
      .select("full_name avatar");

    if (thread) {
      return res
        .status(200)
        .json(
          new AppResponse(200, thread.participants, "", ResponseStatus.SUCCESS)
        );
    }

    // If no thread is found, check for a user with the same ID
    const user = await UserModel.findById(threadkey).select("full_name avatar");

    // If the user is not found, respond with an error
    if (!user) {
      throw new AppError("Unable to find the user or thread", 400);
    }

    return res
      .status(200)
      .json(new AppResponse(200, [user], "", ResponseStatus.SUCCESS));
  }
);
const lastMessageTimestamps: { [threadId: string]: number } = {};

export const sendMessage = catchAsync(async (req: any, res: any) => {
  const { body, contentType, attachments, recipientIds, threadId } = req.body;
  const authorId = req.user._id;
  const participantIds = [authorId, ...recipientIds];

  console.log("recipientIds", recipientIds);

  let thread = await ThreadModel.findById(threadId);

  if (!threadId) {
    thread = await ThreadModel.create({
      participants: participantIds,
      type: participantIds.length > 2 ? ChatType.GROUP : ChatType.ONE_TO_ONE,
    });
  }

  const newMessage = new MessageModel({
    author: authorId,
    attachments,
    body,
    contentType,
  });

  if (newMessage) {
    thread.messages.push(newMessage._id);
  }

  await Promise.all([thread.save(), newMessage.save()]);

  // SOCKET IO FUNCTIONALITY WILL GO HERE

  recipientIds.forEach((recipientId: string) => {
    const receiverSocketId = getReceiverSocketId(recipientId);

    console.log("receiverSocketId", receiverSocketId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", {
        threadId: thread._id,
        message: newMessage,
      });
    }
  });
  const threadKey = thread._id.toString(); // Convert ObjectId to string
  const now = Date.now();

  // If there's a last message timestamp and it's within 30 seconds, skip sending notification
  if (
    lastMessageTimestamps[threadKey] &&
    now - lastMessageTimestamps[threadKey] < 30 * 1000
  ) {
    return res
      .status(201)
      .json(
        new AppResponse(
          201,
          { threadId: thread._id, message: newMessage },
          "",
          ResponseStatus.SUCCESS
        )
      );
  }

  // Update the last message timestamp
  lastMessageTimestamps[threadKey] = now;

  // If it's been more than 30 seconds, send notification
  await sendChatNotification(
    req.user,
    recipientIds,
    `/chat?threadKey=${thread._id}`,
    thread._id
  );

  return res
    .status(201)
    .json(
      new AppResponse(
        201,
        { threadId: thread._id, message: newMessage },
        "",
        ResponseStatus.SUCCESS
      )
    );
});
