// server/validators/orderValidator.js
const Joi = require("joi");
const mongoose = require("mongoose");

// Verifica que un valor tenga el formato correcto de un ObjectId de MongoDB.
// Se usa para validar campos como table y product.
const objectIdValidator = (value, helpers) => {
  // Comprueba que sea un ObjectId válido de MongoDB
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};
// Exportación del esquema: Define las reglas que deben cumplir los datos al crear una orden.
exports.createOrderSchema = Joi.object({
  table: Joi.string()
    .length(24)
    .custom(objectIdValidator, "ObjectId validation")
    .required()
    .messages({
      "string.base": "El ID de la mesa debe ser texto",
      "string.length": "El ID de la mesa debe tener 24 caracteres",
      "any.invalid": "El ID de la mesa no es un ObjectId válido",
      "any.required": "La mesa es obligatoria",
    }),

  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string()
          .length(24)
          .custom(objectIdValidator, "ObjectId validation")
          .required()
          .messages({
            "string.base": "El ID de producto debe ser texto",
            "string.length": "El ID de producto debe tener 24 caracteres",
            "any.invalid": "El ID de producto no es un ObjectId válido",
            "any.required": "El producto es obligatorio",
          }),
        quantity: Joi.number().integer().min(1).required().messages({
          "number.base": "La cantidad debe ser un número",
          "number.min": "La cantidad debe ser al menos 1",
          "any.required": "La cantidad es obligatoria",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Los ítems deben ser un arreglo",
      "array.min": "Debes enviar al menos un ítem",
      "any.required": "Los ítems son obligatorios",
    }),
});
