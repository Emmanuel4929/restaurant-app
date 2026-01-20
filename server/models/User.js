// server/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Roles permitidos en el sistema
const ROLES = ["waiter", "chef", "cashier", "admin"];
// Esquema del usuario
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    //Contraseña encriptada Se guarda el hash de la contraseña, no la contraseña en texto plano.
    passwordHash: {
      type: String,
      required: true,
    },
    // Rol del usuario en el sistema Por defecto es "waiter".
    // Puede ser "waiter", "chef", "cashier" o "admin".
    role: {
      type: String,
      enum: ROLES,
      default: "waiter",
    },
  },
  // Timestamps Agrega automáticamente createdAt y updatedAt.
  { timestamps: true }
);

// Enfoque sin plugin de validación de unicidad
// Mongoose lanzará error 11000 en duplicados y se maneja en el controlador

// Antes de guardar Solo encripta si la contraseña fue modificada.
// Proceso de encriptación Genera un "salt" y encripta la contraseña antes de guardar el usuario.
UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model("User", UserSchema);
