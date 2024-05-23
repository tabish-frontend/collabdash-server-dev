import mongoose, { Schema } from "mongoose";
import { Attendance } from "../types";

const attendanceSchema: Schema<Attendance> = new Schema<Attendance>(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Leave",
        "Short Attendance",
        "Half Day",
        "Full Day",
      ],
      required: true,
    },
    timeIn: { type: Date, required: false },
    timeOut: { type: Date, default: "", required: false },
    duration: { type: Number, default: 0 },
    notes: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export const AttendanceModal = mongoose.model("Attendance", attendanceSchema);
