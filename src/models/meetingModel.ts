import mongoose, { Schema } from "mongoose";
import { Meeting } from "../types";

const meetingSchema: Schema<Meeting> = new Schema<Meeting>(
  {
    title: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MeetingModel = mongoose.model("Meeting", meetingSchema);
