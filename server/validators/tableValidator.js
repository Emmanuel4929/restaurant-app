// server/validators/tableValidator.js
const Joi = require("joi");

// Define las reglas que deben cumplir los datos al crear o actualizar una mesa.
exports.tableSchema = Joi.object({
  number: Joi.number().integer().min(1).required().messages({
    "number.base": "El número de mesa debe ser un número",
    "number.min": "El número de mesa debe ser al menos 1",
    "any.required": "El número de mesa es obligatorio",
  }),
  status: Joi.string()
    .valid("available", "occupied", "offline")
    .required()
    .messages({
      "any.only": "El estado debe ser 'available', 'occupied' o 'offline'",
      "any.required": "El estado es obligatorio",
    }),
});
