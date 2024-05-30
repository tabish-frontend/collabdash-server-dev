import mongoose, { Schema } from "mongoose";
import { Leaves } from "../types";
import { LeavesStatus, LeavesTypes } from "../utils";

const leavesSchema: Schema<Leaves> = new Schema<Leaves>(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: String,
    status: {
      type: String,
      enum: [
        LeavesStatus.Pending,
        LeavesStatus.Approved,
        LeavesStatus.Rejected,
      ],
      required: true,
      default: LeavesStatus.Pending,
    },
    leave_type: {
      type: String,
      enum: [
        LeavesTypes.Half_Day,
        LeavesTypes.Sick,
        LeavesTypes.Casual,
        LeavesTypes.Emergency,
      ],
      required: true,
      default: LeavesStatus.Pending,
    },
  },
  {
    timestamps: true,
  }
);

export const LeavesModel = mongoose.model("Leaves", leavesSchema);
