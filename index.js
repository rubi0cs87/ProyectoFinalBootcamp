require("dotenv").config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import connectCloudinary from "./src/config/cloudinary.js";
import userRoutes from "./src/routes/user.js";
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
