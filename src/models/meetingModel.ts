import mongoose, { Schema } from "mongoose";
import { Meeting } from "../types";

const meetingSchema: Schema<Meeting> = new Schema<Meeting>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
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
    recurring: { type: Boolean, default: false },
    meeting_days: { type: [String], default: [] },
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

MeetingModel.syncIndexes()
  .then(() => {
    console.log("Indexes synchronized successfully for MeetingModel.");
  })
  .catch((error) => {
    console.error("Error synchronizing indexes for MeetingModel:", error);
  });
