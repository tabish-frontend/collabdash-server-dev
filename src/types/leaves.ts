import { Types } from "mongoose";

export interface Leaves {
  user: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reason: string;
  leave_type: string;
  status: string;
}
