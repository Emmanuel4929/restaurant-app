// server/middlewares/validate.js
const createError = require("http-errors");

/**
 * Devuelve un middleware que valida `req.body` contra un schema Joi.
 * @param {Joi.ObjectSchema} schema
 */
module.exports = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    // Concatenamos todos los mensajes de error de Joi
    const msg = error.details.map((d) => d.message).join("; ");
    return next(createError(400, msg));
  }
  next();
};
