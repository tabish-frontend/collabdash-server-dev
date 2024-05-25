"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadUserPhoto = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    filename: (req, file, cb) => {
        console.log("file.mimetype", file.mimetype);
        console.log("req", req);
        console.log("file", file);
        const ext = file.mimetype.split("/")[1];
        cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
    },
});
const upload = (0, multer_1.default)({ storage });
exports.uploadUserPhoto = upload.fields([
    {
        name: "avatar",
        maxCount: 1,
    },
]);
//# sourceMappingURL=multer.js.map