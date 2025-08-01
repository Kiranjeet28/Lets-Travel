import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_URL,
    api_secret: process.env.API_SECRET,
  });
  export const FOLDER_NAME = "top10travels";
  
export default cloudinary;