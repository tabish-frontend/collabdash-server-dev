import mongoose, { Types } from "mongoose";

export interface PushSubscription {
  user: Types.ObjectId;
  endpoint: string; // Push subscription endpoint
  keys: {
    p256dh: string; // Public key
    auth: string; // Auth secret
  };
}
