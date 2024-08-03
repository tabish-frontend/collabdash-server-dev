import mongoose, { Schema, Document } from "mongoose";
import { Workspace } from "kanban/workspace";

const WorkspaceSchema: Schema<Workspace> = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String },
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

export const WorkspaceModel = mongoose.model<Workspace>(
  "Workspace",
  WorkspaceSchema
);
