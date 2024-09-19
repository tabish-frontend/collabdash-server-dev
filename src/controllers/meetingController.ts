import { Roles } from "../types/enum";
import { MeetingModel } from "../models";
import { AppError, AppResponse, ResponseStatus, catchAsync } from "../utils";

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
  const userId = req.user._id;

  let filter = {};

  // Determine filter based on the status
  if (status === "upcoming") {
    filter = { time: { $gte: new Date() } };
  } else if (status === "completed") {
    filter = { time: { $lt: new Date() } };
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
    .sort({ time: 1 });

  return res
    .status(200)
    .json(new AppResponse(200, meetings, "", ResponseStatus.SUCCESS));
});

export const getMeeting = catchAsync(async (req, res) => {
  console.log("API hitting");
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
