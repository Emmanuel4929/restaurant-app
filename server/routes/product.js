// server/routes/product.js
const express = require("express");
const authJWT = require("../middlewares/authJWT");
const validate = require("../middlewares/validate");
const { productSchema } = require("../validators/productValidator");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// GET /api/products → Obtener todos los productos
router.get("/", getAllProducts);

// GET /api/products/:id → Obtener un producto por ID
router.get("/:id", getProductById);

// POST /api/products → Crear producto (rol: chef) con validación
router.post("/", authJWT("chef"), validate(productSchema), createProduct);

// PUT /api/products/:id → Actualizar producto (rol: chef) con validación
router.put("/:id", authJWT("chef"), validate(productSchema), updateProduct);

// DELETE /api/products/:id → Eliminar producto (rol: chef)
router.delete("/:id", authJWT("chef"), deleteProduct);

module.exports = router;
