import mongoose, { Schema } from "mongoose";
import { Notification } from "../../types";

const notificationSchema: Schema<Notification> = new Schema<Notification>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ], // Refers to the user who will receive the notification
    message: { type: String, required: true },
    link: { type: String },
    time: { type: Date },
    target_link: { type: String },
    hide_sender_name: { type: Boolean, default: false },
    read: { type: Boolean, default: false }, // To track if the notification is read
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

export const NotificationModel = mongoose.model(
  "Notification",
  notificationSchema
);
