import { Column } from "kanban/column";
import mongoose, { Schema } from "mongoose";

const ColumnSchema: Schema<Column> = new Schema(
  {
    name: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

export const ColumnModel = mongoose.model<Column>("Column", ColumnSchema);
