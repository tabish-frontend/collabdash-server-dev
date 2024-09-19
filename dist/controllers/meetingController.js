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
exports.getAllMeetings = exports.createMeeting = void 0;
const models_1 = require("../models");
const utils_1 = require("../utils");
exports.createMeeting = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, time, participants } = req.body;
    const owner = req.user._id;
    const newMeeting = yield models_1.MeetingModel.create({
        title,
        time,
        participants,
        owner,
    });
    const populatedMeetings = yield models_1.MeetingModel.findById(newMeeting._id)
        .populate("owner", "full_name username avatar")
        .populate("participants", "full_name username avatar");
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, populatedMeetings, "Meeting Created Successfully", utils_1.ResponseStatus.SUCCESS));
}));
exports.getAllMeetings = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.query;
    let filter = {};
    // Determine filter based on the status
    if (status === "upcoming") {
        filter = { time: { $gte: new Date() } };
    }
    else if (status === "completed") {
        filter = { time: { $lt: new Date() } };
    }
    // Find leaves within the date range and populate user references
    const meetings = yield models_1.MeetingModel.find(filter)
        .populate("owner", "full_name username avatar")
        .populate("participants", "full_name username avatar")
        .sort({ time: 1 });
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, meetings, "", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=meetingController.js.map