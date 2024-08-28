import mongoose from "mongoose";

interface Attachment {
  _id: mongoose.Types.ObjectId;
  name?: string;
  type?: string;
  url?: string;
}

export interface Task extends Document {
  title: string;
  description?: string;
  dueDate: Date;
  priority: string;
  board: mongoose.Types.ObjectId;
  column: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId[];
  owner: mongoose.Types.ObjectId;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}
