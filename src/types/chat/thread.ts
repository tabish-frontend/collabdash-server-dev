import { Types } from "mongoose";

export interface Thread {
  messages: Types.ObjectId[];
  participants: Types.ObjectId[];
  type: string;
}
