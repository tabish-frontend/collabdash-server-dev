import mongoose, { Schema } from "mongoose";
import { Holiday } from "../types";

const holidaySchema: Schema<Holiday> = new Schema<Holiday>(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const HolidayModal = mongoose.model("Holiday", holidaySchema);
