import { Board } from "kanban/boards";
import mongoose, { Schema, Document } from "mongoose";

const BoardSchema: Schema<Board> = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    columns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Column" }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
  },
  { timestamps: true }
);
export const BoardModel = mongoose.model("Board", BoardSchema);
