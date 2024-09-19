import { Roles } from "../types/enum";
import { MeetingModel } from "../models";
import { AppResponse, ResponseStatus, catchAsync } from "../utils";

export const createMeeting = catchAsync(async (req: any, res: any) => {
  const { title, time, participants } = req.body;

  const owner = req.user._id;

  const newMeeting = await MeetingModel.create({
    title,
    time,
    participants,
    owner,
  });

  const populatedMeetings = await MeetingModel.findById(newMeeting._id)
    .populate("owner", "full_name username avatar")
    .populate("participants", "full_name username avatar");

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

export const getAllMeetings = catchAsync(async (req, res) => {
  const { status } = req.query;

  let filter = {};

  // Determine filter based on the status
  if (status === "upcoming") {
    filter = { time: { $gte: new Date() } };
  } else if (status === "completed") {
    filter = { time: { $lt: new Date() } };
  }

  // Find leaves within the date range and populate user references
  const meetings = await MeetingModel.find(filter)
    .populate("owner", "full_name username avatar")
    .populate("participants", "full_name username avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new AppResponse(200, meetings, "", ResponseStatus.SUCCESS));
});
