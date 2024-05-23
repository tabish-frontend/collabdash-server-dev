import { User, Attendance } from "./";

export type AnyObjectType = {
  [key: string]: any;
};

export interface QueryParams {
  search?: string;
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
  status?: string;
  populate?: string;
  populate1?: string;
  month?: number;
  day?: number;
  class_type?: string;
  subject?: string;
}

export type TUser = User | Attendance;
