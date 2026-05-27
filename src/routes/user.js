//Rutas de usuario, con sus respectivos controladores y middlewares

import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../controllers/user.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.delete("/profile", authMiddleware, deleteUserProfile);

export default router;
