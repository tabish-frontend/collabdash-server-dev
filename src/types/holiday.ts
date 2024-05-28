import { Types } from "mongoose";

export interface Holiday {
  title: string;
  date: Date;
  users: Types.ObjectId[];
}
