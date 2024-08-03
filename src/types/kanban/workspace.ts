import mongoose from "mongoose";

export interface Workspace {
  name: string;
  slug: string;
  owner: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  boards: mongoose.Schema.Types.ObjectId[];
}
