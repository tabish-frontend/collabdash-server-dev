import mongoose, { Schema } from "mongoose";
import { Thread } from "../../types";
import { ChatType } from "../../utils";

const threadSchema: Schema<Thread> = new Schema<Thread>(
  {
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
    participants: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    type: {
      type: String,
      enum: [ChatType.ONE_TO_ONE, ChatType.GROUP],
      required: true,
      default: ChatType.ONE_TO_ONE,
    },
  },
  {
    timestamps: true,
  }
);

export const ThreadModel = mongoose.model("Thread", threadSchema);
