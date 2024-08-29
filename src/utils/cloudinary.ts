// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

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

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (locaLFilePath: string | null) => {
  try {
    if (!locaLFilePath) return null;

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(locaLFilePath, {
      resource_type: "auto",
      allowed_formats: ["jpg", "png", "pdf"],
    });

    return response;
  } catch (error) {
    fs.unlinkSync(locaLFilePath); // remove the locally save temporary file as the uplad operation got failed
    return null;
  }
};

export const deleteFromCloudinary = async (id: string) => {
  await cloudinary.uploader.destroy(id);
};
