//Middleware para proteger las rutas que requieren autenticación, verificando el token JWT en las solicitudes entrantes

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

//Aquí se gestiona cuando un usuario es admin o superUser, para permitirle acceder a ciertas rutas o realizar ciertas acciones

const isAdminOrSuperUser = (req, res, next) => {
  if (
    !req.user ||
    (req.user.role !== "admin" && req.user.role !== "superUser")
  ) {
    res.status(403).json({ message: "Credenciales necesarias" });
  } else {
    next();
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Credenciales necesarias" });
  } else {
    next();
  }
};

const isSuperUser = (req, res, next) => {
  if (!req.user || req.user.role !== "superUser") {
    res.status(403).json({ message: "Credenciales necesarias" });
  } else {
    next();
  }
};

module.exports = { authMiddleware, isAdmin, isSuperUser, isAdminOrSuperUser };
