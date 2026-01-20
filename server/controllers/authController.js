// server/controllers/authController.js
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Registro de usuario
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      throw createError(400, "Todos los campos son obligatorios");
    }
    const existing = await User.findOne({ email });
    if (existing) throw createError(409, "El correo ya está registrado");

    const user = new User({ name, email, passwordHash: password, role });
    await user.save();
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    if (err.code === 11000)
      return next(createError(409, "El correo ya está registrado"));
    next(err);
  }
};
// Login de usuario
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw createError(400, "Email y contraseña son requeridos");
    const user = await User.findOne({ email });
    if (!user) throw createError(401, "Credenciales inválidas");

    const match = await user.comparePassword(password);
    if (!match) throw createError(401, "Credenciales inválidas");

    const mongoose = require("mongoose");
    // Verifica que la conexión a la base de datos esté activa
    if (mongoose.connection.readyState !== 1) {
      return res
        .status(503)
        .json({ message: "Servicio de base de datos no disponible" });
    }

    const payload = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });
    res.json({ token, user: payload });
  } catch (err) {
    next(err);
  }
};
