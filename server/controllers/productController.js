// server/controllers/productController.js
const createError = require("http-errors");
const { Product } = require("../models");

// Obtener todos los productos
exports.getAllProducts = async (req, res, next) => {
  try {
    const list = await Product.find();
    res.json(list);
  } catch (err) {
    next(err);
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) throw createError(404, "Producto no encontrado");
    res.json(prod);
  } catch (err) {
    next(err);
  }
};

// Crear un nuevo producto
exports.createProduct = async (req, res, next) => {
  try {
    const newProd = new Product(req.body);
    await newProd.save();
    res.status(201).json(newProd);
  } catch (err) {
    next(err);
  }
};

// Actualizar producto existente
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

// Eliminar un producto
exports.deleteProduct = async (req, res, next) => {
  try {
    const del = await Product.findByIdAndDelete(req.params.id);
    if (!del) throw createError(404, "Producto no encontrado");
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    next(err);
  }
};
