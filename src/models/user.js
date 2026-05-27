// Aquí creamos el modelo del usuario, con su esquema y exportamos el modelo para usarlo en otras partes de la aplicación

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin", "superUser"], default: "user" },
  avatar: { type: String },
  library: [{ type: mongoose.Schema.Types.ObjectId, ref: "gallery" }],
  createdAt: { type: Date, default: Date.now },
});

// Middleware para encriptar la contraseña antes de guardar el usuario

userSchema.pre("save", function () {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
});

const User = mongoose.model("user", userSchema, "users");

export default User;
