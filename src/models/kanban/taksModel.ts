import mongoose, { Schema, Document } from "mongoose";
import { Task } from "kanban/tasks";

const TaskSchema: Schema<Task> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
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
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

export const TaskModel = mongoose.model("Task", TaskSchema);
