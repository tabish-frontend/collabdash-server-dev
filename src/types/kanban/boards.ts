import mongoose from "mongoose";

export interface Board extends Document {
  name: string;
  slug: string;
  description?: string;
  workspace: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;

  members: mongoose.Types.ObjectId[];
  columns: mongoose.Types.ObjectId[];
  tasks: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}
