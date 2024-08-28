import mongoose, { Schema, Document } from "mongoose";
import { Task } from "kanban/tasks";

const AttachmentSchema: Schema = new Schema({
  name: { type: String },
  type: { type: String },
  url: { type: String },
});

const TaskSchema: Schema<Task> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, default: new Date() },
    priority: {
      type: String,
      trim: true,
      enum: ["low", "moderate", "high"],
      default: "moderate",
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    column: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Column",
      required: true,
    },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attachments: { type: [AttachmentSchema], default: [] }, // Default empty arra
  },
  { timestamps: true }
);

export const TaskModel = mongoose.model("Task", TaskSchema);
