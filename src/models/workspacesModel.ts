import mongoose, { Schema, Document } from "mongoose";
import { Workspace } from "workspace";

const WorkspaceSchema: Schema<Workspace> = new Schema(
  {
    name: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const WorkspaceModel = mongoose.model<Workspace>(
  "Workspace",
  WorkspaceSchema
);
