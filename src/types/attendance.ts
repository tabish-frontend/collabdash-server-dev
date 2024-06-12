import { Types } from "mongoose";

export interface Break {
  start: Date;
  end: Date;
  duration: number;
}

export interface Attendance {
  save(): unknown;
  user: Types.ObjectId;
  date: Date;
  status: string;
  timeIn?: Date;
  timeOut?: Date | string;
  duration: number;
  breaks: Break[];
  notes?: string;
}
