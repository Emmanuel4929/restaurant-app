// server/validators/productValidator.js
const Joi = require("joi");

exports.productSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    "string.base": "El nombre debe ser texto",
    "string.empty": "El nombre no puede estar vacío",
    "any.required": "El nombre es obligatorio",
  }),
  price: Joi.number().min(0).required().messages({
    "number.base": "El precio debe ser un número",
    "number.min": "El precio no puede ser negativo",
    "any.required": "El precio es obligatorio",
  }),
  description: Joi.string().max(500).allow("").optional().messages({
    "string.base": "La descripción debe ser texto",
    "string.max": "La descripción no puede exceder 500 caracteres",
  }),
  calories: Joi.number().integer().min(0).required().messages({
    "number.base": "Las calorías deben ser un número entero",
    "number.min": "Las calorías no pueden ser negativas",
    "any.required": "Las calorías son obligatorias",
  }),
  category: Joi.string()
    .valid(
      "Entradas",
      "Hamburguesas",
      "HotDogs",
      "Bebidas",
      "Licores",
      "Especiales"
    )
    .required()
    .messages({
      "any.only": "Categoría inválida",
      "any.required": "La categoría es obligatoria",
    }),
});
