import { Board } from "kanban/boards";
import mongoose, { Schema, Document } from "mongoose";
import { TaskModel } from "./taksModel";
import { ColumnModel } from "./columnModel";

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

// Middleware to delete columns and tasks when a board is deleted
BoardSchema.pre("findOneAndDelete", async function (next) {
  const board = await this.model.findOne(this.getQuery());

  if (!board) return next();

  // Delete all tasks related to the board
  await TaskModel.deleteMany({ column: { $in: board.columns } });

  // Delete all columns
  await ColumnModel.deleteMany({ _id: { $in: board.columns } });

  next();
});

export const BoardModel = mongoose.model("Board", BoardSchema);
