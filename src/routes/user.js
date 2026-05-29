//Rutas de usuario, con sus respectivos controladores y middlewares
const {
  authMiddleware,
  isAdmin,
  isSuperUser,
  isAdminOrSuperUser,
} = require("../middlewares/credentials");

const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  changeUserRole,
} = require("../controllers/user");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, isAdminOrSuperUser, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.delete("/delete/:email", authMiddleware, deleteUserProfile);
router.put("/change-role/:email", authMiddleware, changeUserRole);

module.exports = router;
