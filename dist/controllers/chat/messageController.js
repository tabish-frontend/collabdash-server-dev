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
exports.sendMessage = exports.getParticipitantsByThreadKey = exports.getThreadByKey = exports.getThreads = exports.getContacts = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const index_1 = require("../../index"); // Adjust the path based on your project structure
exports.getContacts = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Always filter out the current user and ensure account_status is "active"
    let filter = {
        _id: { $nin: req.user._id },
        account_status: "active", // default filter
    };
    // Initialize the APIFeatures class with the default filter and query params from req.query
    const features = new utils_1.APIFeatures(models_1.UserModel.find(filter), req.query)
        .filter()
        .search(); // Apply search if provided
    // Bypass the APIFeatures limitFields method and manually set the fields to full_name and avatar
    const contacts = yield features.query.select("full_name avatar");
    return res.status(200).json({
        status: "success",
        results: contacts.length,
        data: contacts,
    });
}));
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
    const userId = req.user.id;
    // If no thread ID is provided, return an error
    if (!threadkey) {
        throw new utils_1.AppError("Thread ID is required", 400);
    }
    let thread = yield models_1.ThreadModel.findById(threadkey)
        .populate({
        path: "participants",
        select: "full_name avatar", // populate relevant fields from participants
    })
        .populate("messages"); // if there are messages to populate
    // If no thread found by threadId, attempt to find by participantIds
    if (!thread) {
        thread = yield models_1.ThreadModel.findOne({
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
            .json(new utils_1.AppResponse(200, null, "", utils_1.ResponseStatus.FAIL));
    }
    // Return the thread with populated participants and messages
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
exports.sendMessage = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body, contentType, attachments, recipientIds, threadId } = req.body;
    const authorId = req.user._id;
    const participantIds = [authorId, ...recipientIds];
    console.log("recipientIds", recipientIds);
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
    recipientIds.forEach((recipientId) => {
        const receiverSocketId = (0, index_1.getReceiverSocketId)(recipientId);
        console.log("receiverSocketId", receiverSocketId);
        if (receiverSocketId) {
            index_1.io.to(receiverSocketId).emit("receiveMessage", {
                threadId: thread._id,
                message: newMessage,
            });
        }
    });
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, { threadId: thread._id, message: newMessage }, "", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=messageController.js.map