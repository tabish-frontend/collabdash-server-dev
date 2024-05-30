import mongoose, { Schema } from "mongoose";
import { Shift, timeDetails } from "../types";

const timeDetailsSchema: Schema<timeDetails> = new Schema<timeDetails>({
  start: { type: Date, default: null },
  end: { type: Date, default: null },
  days: { type: [String], required: true },
});

// Create the Shift schema
const shiftSchema: Schema<Shift> = new Schema<Shift>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    times: { type: [timeDetailsSchema], required: true },
    weekends: { type: [String], required: true },
  },
  {
    timestamps: true,
  }
);

export const ShiftModel = mongoose.model("Shift", shiftSchema);
