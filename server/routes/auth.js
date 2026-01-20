// server/routes/auth.js
const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/register → controlador externo
router.post("/register", register);

// POST /api/auth/login → controlador externo
router.post("/login", login);

module.exports = router;
