import { Types } from "mongoose";

export interface timeDetails {
  start: Date | null;
  end: Date | null;
  days: string[];
}

export interface Shift {
  user: Types.ObjectId;
  shift_type: string;
  hours: number;
  times: timeDetails[];
  weekends: string[];
}
