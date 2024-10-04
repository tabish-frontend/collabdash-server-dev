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
exports.sendMessage = exports.getParticipitantsByThreadKey = exports.getThreadByKey = exports.getThreads = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const index_1 = require("../../index"); // Adjust the path based on your project structure
const utils_2 = require("../../utils");
exports.getThreads = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    // Find threads where the current user is a participant
    const threads = yield models_1.ThreadModel.find({ participants: { $in: [userId] } })
        .populate("participants", "full_name avatar")
        .populate("messages");
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, threads, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.getThreadByKey = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { threadkey } = req.params;
    const { populate } = req.query; // Extract the 'populate' query parameter
    const userId = req.user.id;
    if (!threadkey) {
        throw new utils_1.AppError("Thread ID is required", 400);
    }
    // Create an empty array to hold population conditions
    const populateFields = [];
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
    let thread = yield models_1.ThreadModel.findById(threadkey).populate(populateFields);
    // If no thread is found by threadkey, attempt to find by participants
    if (!thread) {
        thread = yield models_1.ThreadModel.findOne({
            participants: { $all: [userId, threadkey] },
            $expr: { $eq: [{ $size: "$participants" }, 2] }, // Ensure it's a one-on-one chat (exactly 2 participants)
        }).populate(populateFields);
    }
    if (!thread) {
        return res
            .status(200)
            .json(new utils_1.AppResponse(200, null, "", utils_1.ResponseStatus.FAIL));
    }
    // Return the thread with the dynamically populated fields
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, thread, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.getParticipitantsByThreadKey = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { threadkey } = req.params;
    // Check if the thread exists
    const thread = yield models_1.ThreadModel.findById(threadkey)
        .populate("participants")
        .select("full_name avatar");
    if (thread) {
        return res
            .status(200)
            .json(new utils_1.AppResponse(200, thread.participants, "", utils_1.ResponseStatus.SUCCESS));
    }
    // If no thread is found, check for a user with the same ID
    const user = yield models_1.UserModel.findById(threadkey).select("full_name avatar");
    // If the user is not found, respond with an error
    if (!user) {
        throw new utils_1.AppError("Unable to find the user or thread", 400);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, [user], "", utils_1.ResponseStatus.SUCCESS));
}));
const lastMessageTimestamps = {};
exports.sendMessage = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body, contentType, attachments, recipientIds, threadId } = req.body;
    const authorId = req.user._id;
    const participantIds = [authorId, ...recipientIds];
    const filterRecipientIds = recipientIds.filter((recipientId) => recipientId !== req.user._id.toString());
    let thread = yield models_1.ThreadModel.findById(threadId);
    if (!threadId) {
        thread = yield models_1.ThreadModel.create({
            participants: participantIds,
            type: participantIds.length > 2 ? utils_1.ChatType.GROUP : utils_1.ChatType.ONE_TO_ONE,
        });
    }
    const newMessage = new models_1.MessageModel({
        author: authorId,
        attachments,
        body,
        contentType,
    });
    if (newMessage) {
        thread.messages.push(newMessage._id);
    }
    yield Promise.all([thread.save(), newMessage.save()]);
    // SOCKET IO FUNCTIONALITY WILL GO HERE
    filterRecipientIds.forEach((recipientId) => {
        const receiverSocketId = (0, index_1.getReceiverSocketId)(recipientId);
        if (receiverSocketId) {
            index_1.io.to(receiverSocketId).emit("receiveMessage", {
                threadId: thread._id,
                message: newMessage,
            });
        }
    });
    const threadKey = thread._id.toString(); // Convert ObjectId to string
    const now = Date.now();
    // If there's a last message timestamp and it's within 30 seconds, skip sending notification
    if (lastMessageTimestamps[threadKey] &&
        now - lastMessageTimestamps[threadKey] < 30 * 1000) {
        return res
            .status(201)
            .json(new utils_1.AppResponse(201, { threadId: thread._id, message: newMessage }, "", utils_1.ResponseStatus.SUCCESS));
    }
    // Update the last message timestamp
    lastMessageTimestamps[threadKey] = now;
    // If it's been more than 30 seconds, send notification
    yield (0, utils_2.sendChatNotification)(req.user, thread._id.toString(), filterRecipientIds, contentType);
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, { threadId: thread._id, message: newMessage }, "", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=messageController.js.map