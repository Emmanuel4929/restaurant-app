// server/routes/orders.js
const express = require("express");
const authJWT = require("../middlewares/authJWT");
const validate = require("../middlewares/validate");
const { createOrderSchema } = require("../validators/orderValidator");
const {
  createOrder,
  getKitchenOrders,
  markOrderReady,
} = require("../controllers/orderController");

const router = express.Router();

// POST /api/orders → Crear nueva orden (rol: waiter) con validación
router.post("/", authJWT("waiter"), validate(createOrderSchema), createOrder);

// GET /api/orders/kitchen → Lista de pendientes (rol: chef)
router.get("/kitchen", authJWT("chef"), getKitchenOrders);

// PUT /api/orders/:id/ready → Marcar listo (rol: chef)
router.put("/:id/ready", authJWT("chef"), markOrderReady);

module.exports = router;
