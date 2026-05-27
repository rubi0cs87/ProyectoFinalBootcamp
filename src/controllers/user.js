// Aquí creamos los controladores para el usuario, con las funciones para registrar, iniciar sesión, obtener el perfil, actualizar el perfil y eliminar el perfil

import User from "../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import getOrCreateDefaultAvatar from "../utils/useOrCreateAvatar";
import validations from "../utils/validations";
import deleteFile from "../utils/deleteFile";

//funcion para registrar un nuevo usuario

const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!validations(email, password)) {
      return res
        .status(400)
        .json({ message: "Invalid email or password format" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const avatarUrl = await getOrCreateDefaultAvatar();
    const newUser = new User({ email, password, avatar: avatarUrl });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

//funcion para iniciar sesión

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );
    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

//funcion para obtener el perfil del usuario

const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId)
      .select("-password")
      .populate("library");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

//funcion para actualizar el perfil del usuario

const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { email, password } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (email) {
      if (!validations(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      user.email = email;
    }
    if (password) {
      if (!validations(email, password)) {
        return res.status(400).json({ message: "Invalid password format" });
      }
      user.password = password;
    }
    await user.save();
    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    next(error);
  }
};

//funcion para eliminar el perfil del usuario

const deleteUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    deleteFile(user.avatar);
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User profile deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
