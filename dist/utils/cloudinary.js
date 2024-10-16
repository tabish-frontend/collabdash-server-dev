"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadOnCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = (locaLFile) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!locaLFile)
            return null;
        const fileExtension = locaLFile.originalname.split(".").pop(); // Get the file extension
        const publicIdWithoutExtension = locaLFile.originalname.replace(/\.[^/.]+$/, ""); // Remove existing extension
        // Upload the file to Cloudinary
        const response = yield cloudinary_1.v2.uploader.upload(locaLFile.path, {
            resource_type: "auto",
            public_id: publicIdWithoutExtension,
            format: fileExtension,
            use_filename: true,
            unique_filename: false,
        });
        console.log("response", response);
        // Clean up the local file after upload
        fs_1.default.unlinkSync(locaLFile.path); // Remove the local file after upload
        return response; // Return the Cloudinary response
    }
    catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        if (fs_1.default.existsSync(locaLFile.path)) {
            fs_1.default.unlinkSync(locaLFile.path); // Clean up the local file on error
        }
        return null;
    }
});
exports.uploadOnCloudinary = uploadOnCloudinary;
const deleteFromCloudinary = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield cloudinary_1.v2.uploader.destroy(id);
});
exports.deleteFromCloudinary = deleteFromCloudinary;
//# sourceMappingURL=cloudinary.js.map