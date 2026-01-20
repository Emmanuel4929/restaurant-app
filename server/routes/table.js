// server/routes/table.js
const express = require("express");
const authJWT = require("../middlewares/authJWT");
const {
  getAllTables,
  createTable,
  updateTableStatus,
  deleteTable,
} = require("../controllers/tableController");

const router = express.Router();

// GET   /api/tables        → obtener todas las mesas
router.get("/", getAllTables);

// POST  /api/tables        → crear nueva mesa (rol: chef)
router.post("/", authJWT("chef"), createTable);

// PATCH /api/tables/:id    → actualizar estado (rol: chef)
router.patch("/:id", authJWT("chef"), updateTableStatus);

// DELETE /api/tables/:id   → eliminar mesa (rol: chef)
router.delete("/:id", authJWT("chef"), deleteTable);

module.exports = router;
