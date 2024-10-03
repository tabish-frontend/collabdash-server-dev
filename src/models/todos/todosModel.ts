import mongoose, { Schema } from "mongoose";
import { Todos } from "../../types";

const todosSchema: Schema<Todos> = new Schema<Todos>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

export const TodosModel = mongoose.model("Todos", todosSchema);
