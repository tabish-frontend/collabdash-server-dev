import { MessageModel, ThreadModel, UserModel } from "../../models";
import {
  AppError,
  AppResponse,
  catchAsync,
  ChatType,
  ResponseStatus,
} from "../../utils";
import { io, getReceiverSocketId } from "../../index"; // Adjust the path based on your project structure

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

  const userId = req.user.id;
  // If no thread ID is provided, return an error
  if (!threadkey) {
    throw new AppError("Thread ID is required", 400);
  }

  let thread = await ThreadModel.findById(threadkey)
    .populate({
      path: "participants", // assuming participants field is an array of user/contact IDs
      select: "full_name avatar", // populate relevant fields from participants
    })
    .populate("messages"); // if there are messages to populate

  // If no thread found by threadId, attempt to find by participantIds
  if (!thread) {
    thread = await ThreadModel.findOne({
      participants: { $all: [userId, threadkey] },
    })
      .populate({
        path: "participants",
        select: "full_name avatar",
      })
      .populate("messages");
  }

  // If no thread found at all, return null
  if (!thread) {
    return res
      .status(200)
      .json(new AppResponse(200, null, "", ResponseStatus.FAIL));
  }
  // Return the thread with populated participants and messages
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
