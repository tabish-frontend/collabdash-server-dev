import mongoose, { Schema } from "mongoose";
import { Message } from "../../types";

const AttachmentSchema: Schema = new Schema({
  name: { type: String },
  type: { type: String },
  url: { type: String },
});

const messageSchema: Schema<Message> = new Schema<Message>(
  {
    attachments: { type: [AttachmentSchema], default: [] },
    body: { type: String, required: true },
    contentType: { type: String },
    author: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

export const MessageModel = mongoose.model("Message", messageSchema);
