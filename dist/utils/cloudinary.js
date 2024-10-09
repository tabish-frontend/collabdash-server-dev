"use strict";
// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";
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
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// export const uploadOnCloudinary = async (locaLFilePath: string | null) => {
//   try {
//     if (!locaLFilePath) return null;
//     // Determine the file type based on extension
//     const fileExtension = locaLFilePath.split(".").pop()?.toLowerCase();
//     let resourceType: "image" | "video" | "raw" | "auto" = "auto";
//     // If it's a document, set resource_type to 'raw'
//     if (["pdf", "doc", "docx", "txt"].includes(fileExtension || "")) {
//       resourceType = "raw";
//     }
//     // Upload the file on Cloudinary
//     const response = await cloudinary.uploader.upload(locaLFilePath, {
//       resource_type: resourceType,
//       allowed_formats: ["jpg", "png", "pdf", "doc", "docx", "txt"],
//     });
//     fs.unlinkSync(locaLFilePath); // Remove the locally saved temporary file after successful upload
//     return response;
//   } catch (error) {
//     fs.unlinkSync(locaLFilePath); // Remove the locally saved temporary file if the upload fails
//     return null;
//   }
// };
// export const deleteFromCloudinary = async (id: string) => {
//   await cloudinary.uploader.destroy(id);
// };
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = (locaLFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!locaLFilePath)
            return null;
        // upload the file on cloudinary
        const response = yield cloudinary_1.v2.uploader.upload(locaLFilePath, {
            resource_type: "auto",
        });
        return response;
    }
    catch (error) {
        fs_1.default.unlinkSync(locaLFilePath); // remove the locally save temporary file as the uplad operation got failed
        return null;
    }
});
exports.uploadOnCloudinary = uploadOnCloudinary;
const deleteFromCloudinary = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield cloudinary_1.v2.uploader.destroy(id);
});
exports.deleteFromCloudinary = deleteFromCloudinary;
//# sourceMappingURL=cloudinary.js.map