require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const connectCloudinary = require("./src/config/cloudinary");
const userRoutes = require("./src/routes/user");
// import galleryRoutes from "./src/routes/gallery.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
// app.use("/api/gallery", galleryRoutes);

app.use(/.*/, (req, res, next) => {
  return res.status(404).json("Ruta no encontrada");
});

const startServer = async () => {
  try {
    await connectCloudinary();
    await connectDB();

    app.listen(process.env.PORT || 3000, () => {
      console.log(
        `Servidor escuchando en el puerto ${process.env.PORT || 3000}`,
      );
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
};

startServer();
