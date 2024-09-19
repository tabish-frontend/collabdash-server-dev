import { Types } from "mongoose";

export interface Meeting {
  title: string;
  time: Date;
  participants: Types.ObjectId[];
  owner: Types.ObjectId;
}
