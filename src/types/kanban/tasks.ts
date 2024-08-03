import mongoose from "mongoose";

export interface Task extends Document {
  title: string;
  description?: string;
  board: mongoose.Types.ObjectId;
  column: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId[];
  owner: mongoose.Types.ObjectId;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}
