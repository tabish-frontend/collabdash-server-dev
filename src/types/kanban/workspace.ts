import mongoose from "mongoose";

export interface Workspace {
  name: string;
  owner: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
}
