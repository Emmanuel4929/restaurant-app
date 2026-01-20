// server/routes/admin.js
const express = require("express");
const authJWT = require("../middlewares/authJWT");
const validate = require("../middlewares/validate");
const { productSchema } = require("../validators/productValidator");
const { tableSchema } = require("../validators/tableValidator");
const ctrl = require("../controllers/adminController");

const router = express.Router();

// Todas las rutas bajo /api/admin requieren rol 'admin'
router.use(authJWT("admin"));

// Productos
router.get("/products", ctrl.listProducts);
router.post("/products", validate(productSchema), ctrl.createProduct);
router.put("/products/:id", validate(productSchema), ctrl.updateProduct);
router.delete("/products/:id", ctrl.deleteProduct);

// Usuarios
router.get("/users", ctrl.listUsers);
router.delete("/users/:id", ctrl.deleteUser);

// Mesas
router.get("/tables", ctrl.listTables);
router.post("/tables", validate(tableSchema), ctrl.createTable);
router.patch("/tables/:id", validate(tableSchema), ctrl.updateTable);
router.delete("/tables/:id", ctrl.deleteTable);

module.exports = router;
