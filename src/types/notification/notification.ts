import { Types } from "mongoose";

export interface Notification {
  sender: Types.ObjectId; // User ID who is receiving the notification
  receiver: Types.ObjectId; // User ID who is receiving the notification
  message: string;
  read: boolean; // Has the user read the notification
  link: string;
  time: Date;
}
