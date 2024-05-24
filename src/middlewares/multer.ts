import multer from "multer";
import { AppError } from "../utils";

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    console.log("file.mimetype", file.mimetype);
    console.log("req", req);
    console.log("file", file);

    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage });

export const uploadUserPhoto = upload.fields([
  {
    name: "avatar",
    maxCount: 1,
  },
]);
