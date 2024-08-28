import multer from "multer";

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage });

export const uploadUserPhoto = upload.fields([
  {
    name: "attachment",
    maxCount: 1,
  },
]);
