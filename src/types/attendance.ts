import { Types } from "mongoose";

export interface Attendance {
  user: Types.ObjectId;
  date: Date;
  status: string;
  timeIn: Date;
  timeOut: Date | string;
  duration: number;
  notes: string;
}
