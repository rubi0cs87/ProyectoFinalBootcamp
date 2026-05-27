import cloudinary from "cloudinary";

const deleteFile = async (url) => {
  try {
    if (!url || url.includes("defaultAvatar")) return;

    const array = url.split("/");
    const name = array.at(-1).split(".")[0];

    let public_id = `${array.at(-2)}/${name}`;

    await cloudinary.v2.uploader.destroy(public_id, () => {
      console.log("Archivo eliminado de Cloudinary:", public_id);
    });
  } catch (error) {
    console.error("Error al eliminar el archivo de Cloudinary:", error);
  }
};

export default deleteFile;
