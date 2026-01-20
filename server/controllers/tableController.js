// server/controllers/tableController.js
const createError = require("http-errors");
const { Table } = require("../models");

/**
 * Obtener todas las mesas
 */
exports.getAllTables = async (req, res, next) => {
  try {
    const list = await Table.find().sort("number");
    res.json(list);
  } catch (err) {
    next(err);
  }
};

/**
 * Crear nueva mesa (solo chef)
 */
exports.createTable = async (req, res, next) => {
  try {
    const newTable = new Table(req.body);
    await newTable.save();
    res.status(201).json(newTable);
  } catch (err) {
    next(err);
  }
};

/**
 * Actualizar estado de una mesa (solo chef)
 */
exports.updateTableStatus = async (req, res, next) => {
  try {
    const updated = await Table.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updated) throw createError(404, "Mesa no encontrada");
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Eliminar una mesa (solo chef)
 */
exports.deleteTable = async (req, res, next) => {
  try {
    const del = await Table.findByIdAndDelete(req.params.id);
    if (!del) throw createError(404, "Mesa no encontrada");
    res.json({ message: "Mesa eliminada" });
  } catch (err) {
    next(err);
  }
};
