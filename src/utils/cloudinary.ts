import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (locaLFile: Express.Multer.File) => {
  try {
    if (!locaLFile) return null;

    const fileExtension = locaLFile.originalname.split(".").pop(); // Get the file extension

    const publicIdWithoutExtension = locaLFile.originalname.replace(
      /\.[^/.]+$/,
      ""
    ); // Remove existing extension

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(locaLFile.path, {
      resource_type: "auto",
      public_id: publicIdWithoutExtension,
      format: fileExtension,
      use_filename: true,
      unique_filename: false,
    });

    console.log("response", response);

    // Clean up the local file after upload
    fs.unlinkSync(locaLFile.path); // Remove the local file after upload
    return response; // Return the Cloudinary response
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    if (fs.existsSync(locaLFile.path)) {
      fs.unlinkSync(locaLFile.path); // Clean up the local file on error
    }
    return null;
  }
};

export const deleteFromCloudinary = async (id: string) => {
  await cloudinary.uploader.destroy(id);
};
