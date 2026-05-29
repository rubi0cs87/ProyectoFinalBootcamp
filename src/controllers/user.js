// Aquí creamos los controladores para el usuario, con las funciones para registrar, iniciar sesión, obtener el perfil, actualizar el perfil y eliminar el perfil

const User = require("../models/user");
const bcrypt = require("bcrypt");
const getOrCreateDefaultAvatar = require("../utils/useOrCreateAvatar");
const validations = require("../utils/validations");
const deleteFile = require("../utils/deleteFile");
const { generateToken } = require("../utils/jwt");

//funcion para registrar un nuevo usuario

const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Se requiere email y contraseña" });
    }

    if (!validations(email, password)) {
      return res
        .status(400)
        .json({ message: "Formato de email o contraseña inválido" });
    }

    const user = new User({ email, password, role: "user" });
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email ya en uso" });
    }

    if (req.file) {
      user.avatar = req.file.secure_url;
    } else {
      user.avatar = await getOrCreateDefaultAvatar();
    }

    const userSaved = await user.save();
    const { password: _pw, ...userResponse } = userSaved.toObject();

    res
      .status(201)
      .json({ message: "Usuario registrado exitosamente", user: userResponse });
  } catch (error) {
    next(error);
  }
};

//funcion para iniciar sesión

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    if (bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user._id, user.role);
      const { password: _pw, ...userResponse } = user.toObject();

      return res.status(200).json({ token, user: userResponse });
    } else {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

//funcion para obtener el perfil del usuario

const getUserProfile = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al obtener los perfiles de usuarios" });
  }
};

//funcion para actualizar el perfil del usuario

const updateUserProfile = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (email) {
      const emailTaken = await User.findOne({
        email,
        _id: { $ne: req.user._id },
      });
      if (emailTaken) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.file) {
      if (currentUser.avatar && !currentUser.avatar.includes("userDefault")) {
        await deleteFile(currentUser.avatar);
      }
      currentUser.avatar = req.file.secure_url;
    }

    if (email) currentUser.email = email;
    if (password) currentUser.password = password;

    const userSaved = await currentUser.save();
    const { password: _pw, ...userResponse } = userSaved.toObject();

    return res.status(200).json(userResponse);
  } catch (error) {
    return res.status(400).json({ message: "Error updating user" });
  }
};

// Cambio de rol unificado:
// - superUser: user<->admin y puede transferir superUser (pierde superUser y pasa a admin)
// - admin: solo user -> admin
// - user: sin permisos

const changeUserRole = async (req, res) => {
  try {
    const actorRole = req.user.role;
    const actorId = req.user.userId;
    const { email } = req.params;
    const { role: nextRole } = req.body;

    if (!nextRole || !["user", "admin", "superUser"].includes(nextRole)) {
      return res.status(400).json({ message: "Rol destino inválido" });
    }

    if (actorRole === "user") {
      return res.status(403).json({ message: "No tienes permisos" });
    }

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (actorRole === "admin") {
      const canPromoteToAdmin =
        targetUser.role === "user" && nextRole === "admin";
      if (!canPromoteToAdmin) {
        return res.status(403).json({
          message: "Un admin solo puede promover user a admin",
        });
      }

      targetUser.role = "admin";
      await targetUser.save();
      return res.status(200).json({
        message: "Rol actualizado correctamente",
        user: { email: targetUser.email, role: targetUser.role },
      });
    }

    if (actorRole === "superUser") {
      if (nextRole === "superUser") {
        if (String(targetUser._id) === String(actorId)) {
          return res.status(400).json({
            message: "Ya eres superUser",
          });
        }

        const actorUser = await User.findById(actorId);
        if (!actorUser || actorUser.role !== "superUser") {
          return res
            .status(403)
            .json({ message: "Solo un superUser puede transferir este rol" });
        }

        targetUser.role = "superUser";
        actorUser.role = "admin";
        await Promise.all([targetUser.save(), actorUser.save()]);

        return res.status(200).json({
          message: "Rol superUser transferido correctamente",
          promoted: { email: targetUser.email, role: targetUser.role },
          previousSuperUser: { email: actorUser.email, role: actorUser.role },
        });
      }

      if (targetUser.role === "superUser") {
        return res.status(403).json({
          message: "No puedes cambiar el rol de un superUser desde esta acción",
        });
      }

      targetUser.role = nextRole;
      await targetUser.save();
      return res.status(200).json({
        message: "Rol actualizado correctamente",
        user: { email: targetUser.email, role: targetUser.role },
      });
    }

    return res.status(403).json({ message: "No tienes permisos" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating role" });
  }
};

// Funcion para eliminar el perfil del usuario
// Un superUser no puede eliminar su perfil, pero puede eliminar el de cualquier otro usuario, admin o user
// Un admin puede eliminar su perfil y el de un user, pero no el de otro admin ni el de un superUser
// Un user solo puede eliminar su perfil

const deleteUserProfile = async (req, res, next) => {
  try {
    const actorRole = req.user.role;
    const actorId = req.user.userId;
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    if (actorRole === "superUser" && String(user._id) === String(actorId)) {
      return res
        .status(403)
        .json({ message: "Un superUser no puede eliminar su perfil" });
    }
    if (
      actorRole === "admin" &&
      (user.role === "admin" || user.role === "superUser")
    ) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para eliminar este perfil" });
    }
    if (actorRole === "admin") {
      if (String(user._id) === String(actorId)) {
        await User.findByIdAndDelete(user._id);
        return res
          .status(200)
          .json({ message: "Perfil de usuario eliminado exitosamente" });
      }
      if (user.role === "user") {
        await User.findByIdAndDelete(user._id);
        return res
          .status(200)
          .json({ message: "Perfil de usuario eliminado exitosamente" });
      }
    }
    if (actorRole === "user") {
      if (String(user._id) !== String(actorId)) {
        return res
          .status(403)
          .json({ message: "No tienes permisos para eliminar este perfil" });
      }
    }

    deleteFile(user.avatar);
    await User.findByIdAndDelete(user._id);
    res
      .status(200)
      .json({ message: "Perfil de usuario eliminado exitosamente" });
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
  changeUserRole,
};
