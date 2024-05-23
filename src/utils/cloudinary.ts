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
    });

    // file has been uploaded successfully
    // console.log("File is uploaded on Cloudinary", response.url);
    // await fs.unlink(locaLFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(locaLFilePath); // remove the locally save temporary file as the uplad operation got failed
    return null;
  }
};
