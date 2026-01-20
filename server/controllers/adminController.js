// server/controllers/adminController.js
const createError = require("http-errors");
const { Product, User, Table } = require("../models");

/** PRODUCTOS **/
// Lista todos los productos (sin paginar). Respuesta: array de productos.
exports.listProducts = async (req, res, next) => {
  try {
    const prods = await Product.find();
    res.json(prods);
  } catch (err) {
    next(err);
  }
};
// Crea un nuevo producto con los datos enviados en req.body.
exports.createProduct = async (req, res, next) => {
  try {
    const p = new Product(req.body);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    next(err);
  }
};
// Actualiza un producto existente (id en req.params.id) con los datos de req.body.
exports.updateProduct = async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) throw createError(404, "Producto no encontrado");
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
// Elimina un producto existente (id en req.params.id).
exports.deleteProduct = async (req, res, next) => {
  try {
    const del = await Product.findByIdAndDelete(req.params.id);
    if (!del) throw createError(404, "Producto no encontrado");
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    next(err);
  }
};

/** USUARIOS **/
// Lista todos los usuarios (sin paginar). Respuesta: array de usuarios sin el campo passwordHash.
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    next(err);
  }
};
// Crea un nuevo usuario con los datos enviados en req.body.
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      throw createError(400, "No puedes eliminar tu propia cuenta");
    }
    const del = await User.findByIdAndDelete(req.params.id);
    if (!del) throw createError(404, "Usuario no encontrado");
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    next(err);
  }
};

/** MESAS **/
// Lista todas las mesas (sin paginar). Respuesta: array de mesas.
exports.listTables = async (req, res, next) => {
  try {
    const list = await Table.find().sort("number");
    res.json(list);
  } catch (err) {
    next(err);
  }
};
// Crea una nueva mesa con los datos enviados en req.body.
exports.createTable = async (req, res, next) => {
  try {
    const t = new Table(req.body);
    await t.save();
    res.status(201).json(t);
  } catch (err) {
    next(err);
  }
};
// Actualiza una mesa existente (id en req.params.id) con los datos de req.body.
exports.updateTable = async (req, res, next) => {
  try {
    const updated = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) throw createError(404, "Mesa no encontrada");
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
// Elimina una mesa existente (id en req.params.id).
exports.deleteTable = async (req, res, next) => {
  try {
    const del = await Table.findByIdAndDelete(req.params.id);
    if (!del) throw createError(404, "Mesa no encontrada");
    res.json({ message: "Mesa eliminada" });
  } catch (err) {
    next(err);
  }
};
