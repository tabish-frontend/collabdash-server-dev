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

// Post hook to populate fields after save
meetingSchema.post("save", async function (this: any) {
  // Populate owner
  await this.populate("owner", "full_name username avatar");
  // Populate participants
  await this.populate("participants", "full_name username avatar time_zone");
});

export const MeetingModel = mongoose.model("Meeting", meetingSchema);
