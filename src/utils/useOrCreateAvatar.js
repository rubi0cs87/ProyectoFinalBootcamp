// Aquí subiremos el avatar Default si el usuario no sube uno, en caso de ya estar subido el avatar default, lo usaremos para el nuevo usuario

import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getOrCreateDefaultAvatar = async () => {
  try {
    const pathToAvatar = path.join(__dirname, "../assets/userDefault.png");
    const result = await cloudinary.uploader.upload(pathToAvatar, {
      public_id: "defaultAvatar",
      folder: "NCFotografia/avatars",
      overwrite: false,
      unique_filename: false,
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading default avatar:", error);
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/NCFotografia/avatars/defaultAvatar.jpg`;
  }
};

export default getOrCreateDefaultAvatar;
