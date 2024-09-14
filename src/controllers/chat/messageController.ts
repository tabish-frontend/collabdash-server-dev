import { MessageModel, ThreadModel } from "../../models";
import { AppResponse, catchAsync, ChatType, ResponseStatus } from "../../utils";

export const getThreads = catchAsync(async (req: any, res: any) => {
  const thread = await ThreadModel.find()
    .populate("participants")
    .populate("messages");

  return res
    .status(201)
    .json(new AppResponse(201, thread, "", ResponseStatus.SUCCESS));
});

export const sendMessage = catchAsync(async (req: any, res: any) => {
  const { body, contentType, attachments, recipientIds, threadId } = req.body;
  const authorId = req.user._id;
  const participantIds = [authorId, ...recipientIds];

  console.log("req.body", req.body);

  console.log("authorId", authorId);

  console.log("participantIds", participantIds);

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

  // SOCKET IO FUNCTIONALITY WILL GO HERE

  await Promise.all([thread.save(), newMessage.save()]);

  return res
    .status(201)
    .json(new AppResponse(201, newMessage, "", ResponseStatus.SUCCESS));
});

export const getMessages = catchAsync(async (req: any, res: any) => {
  const { threadId } = req.params;

  const thread = await ThreadModel.findById(threadId).populate("messages");

  // const messages = !thread ? [] : thread.messages;

  return res
    .status(200)
    .json(new AppResponse(201, thread, "", ResponseStatus.SUCCESS));
});
