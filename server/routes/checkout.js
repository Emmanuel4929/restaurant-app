// server/routes/checkout.js
const express = require("express");
const authJWT = require("../middlewares/authJWT");
const {
  getOrderForCheckout,
  payOrder,
} = require("../controllers/checkoutController");

const router = express.Router();

// GET /api/checkout/:tableNumber → facturación (rol: cashier)
router.get("/:tableNumber", authJWT("cashier"), getOrderForCheckout);

// POST /api/checkout/:tableNumber/pay → marcar como pagada
router.post("/:tableNumber/pay", authJWT("cashier"), payOrder);

module.exports = router;
