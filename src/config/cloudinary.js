const cloudinary = require("cloudinary").v2;

const connectCloudinary = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("Conexión a Cloudinary establecida");
  } catch (error) {
    console.error("Error al conectar a Cloudinary:", error);
    throw error;
  }
};

module.exports = connectCloudinary;
