import { Types } from "mongoose";

interface Attachment {
  _id: Types.ObjectId;
  name?: string;
  type?: string;
  url?: string;
}

export interface Message {
  attachments: Attachment[];
  body: string;
  contentType: string;
  author: Types.ObjectId;
}
