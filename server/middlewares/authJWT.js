// server/middlewares/authJWT.js

const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const createError = require("http-errors"); // npm install http-errors

const verifyAsync = promisify(jwt.verify);

/**
 * Middleware de autenticación y autorización JWT.
 * @param {string|string[]} allowedRoles – Rol único o array de roles permitidos. Si vacío, permite cualquier usuario autenticado.
 */
const authJWT = (allowedRoles = []) => {
  // Asegurarnos de que siempre trabajamos con un array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || "";
      if (!authHeader.startsWith("Bearer ")) {
        throw createError(
          401,
          "Formato de token inválido. Debe usar 'Bearer <token>'."
        );
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw createError(401, "Token no proporcionado.");
      }

      // Verificamos firma y expiración
      const user = await verifyAsync(token, process.env.JWT_SECRET);

      // Comprobamos roles si se han especificado
      if (roles.length && !roles.includes(user.role)) {
        throw createError(403, "No tienes permisos para este recurso.");
      }

      // Adjuntamos usuario validado a la request
      req.user = user;
      next();
    } catch (err) {
      // Si es un HttpError, lo dejamos pasar; si no, convertimos
      if (!err.status) {
        err = createError(401, "Token inválido o expirado.");
      }
      next(err);
    }
  };
};

module.exports = authJWT;
