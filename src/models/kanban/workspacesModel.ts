import mongoose, { Schema, Document } from "mongoose";
import { Workspace } from "kanban/workspace";
import { BoardModel } from "./boardModel";
import { TaskModel } from "./taksModel";
import { ColumnModel } from "./columnModel";

const WorkspaceSchema: Schema<Workspace> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    boards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }],
  },
  { timestamps: true }
);

// Middleware to delete all related boards, columns, and tasks
WorkspaceSchema.pre("findOneAndDelete", async function (next) {
  const workspace = await this.model.findOne(this.getQuery());

  if (!workspace) return next();

  // Delete all boards related to the workspace
  const boards = await BoardModel.find({ workspace: workspace._id });
  const columnIds = boards.flatMap((board) => board.columns);

  // Delete all tasks related to the columns
  await TaskModel.deleteMany({ column: { $in: columnIds } });

  // Delete all columns
  await ColumnModel.deleteMany({ _id: { $in: columnIds } });

  // Delete all boards
  await BoardModel.deleteMany({ workspace: workspace._id });

  next();
});

export const WorkspaceModel = mongoose.model<Workspace>(
  "Workspace",
  WorkspaceSchema
);
