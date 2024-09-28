import mongoose, { Schema } from "mongoose";
import { PushSubscription } from "../../types";

const pushSubscriptionSchema: Schema<PushSubscription> =
  new Schema<PushSubscription>(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
      },
    },
    {
      timestamps: true,
    }
  );
export const PushSubscriptionModel = mongoose.model(
  "PushSubscription",
  pushSubscriptionSchema
);
