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
exports.getMessages = exports.sendMessage = exports.getThreads = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
exports.getThreads = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const thread = yield models_1.ThreadModel.find()
        .populate("participants")
        .populate("messages");
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, thread, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.sendMessage = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body, contentType, attachments, recipientIds, threadId } = req.body;
    const authorId = req.user._id;
    const participantIds = [authorId, ...recipientIds];
    console.log("req.body", req.body);
    console.log("authorId", authorId);
    console.log("participantIds", participantIds);
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
    // SOCKET IO FUNCTIONALITY WILL GO HERE
    yield Promise.all([thread.save(), newMessage.save()]);
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, newMessage, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.getMessages = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { threadId } = req.params;
    const thread = yield models_1.ThreadModel.findById(threadId).populate("messages");
    // const messages = !thread ? [] : thread.messages;
    return res
        .status(200)
        .json(new utils_1.AppResponse(201, thread, "", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=messageController.js.map