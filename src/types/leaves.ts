import { Types } from "mongoose";

export interface Leaves {
  user: Types.ObjectId;
  date: Date;
  reason: string;
  leave_type: string;
  status: string;
}
