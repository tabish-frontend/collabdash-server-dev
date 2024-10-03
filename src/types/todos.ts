import { Types } from "mongoose";

export interface Todos {
  owner: Types.ObjectId;
  title: string;
  date: Date;
  completed: boolean;
}
