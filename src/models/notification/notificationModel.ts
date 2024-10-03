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

// Post hook to populate fields after save
notificationSchema.post("save", async function (this: any) {
  await this.populate("sender", "full_name username avatar"); // Populate sender
  await this.populate("receiver", "full_name username avatar"); // Populate receivers
});

export const NotificationModel = mongoose.model(
  "Notification",
  notificationSchema
);
