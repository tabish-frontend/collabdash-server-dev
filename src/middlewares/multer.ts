import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

export const uploadUserPhoto = upload.fields([
  {
    name: "avatar",
    maxCount: 1,
  },
]);
