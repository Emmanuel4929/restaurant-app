// server/controllers/checkoutController.js
const createError = require("http-errors");
const { Order, Table } = require("../models");

// GET /api/checkout/:tableNumber
exports.getOrderForCheckout = async (req, res, next) => {
  try {
    // 1) Parseamos el número de mesa
    const tableNumber = parseInt(req.params.tableNumber, 10);
    if (isNaN(tableNumber)) {
      throw createError(400, "Número de mesa inválido");
    }

    // 2) Buscamos el documento Table para traducir número → _id
    const tableDoc = await Table.findOne({ number: tableNumber });
    if (!tableDoc) {
      throw createError(404, "La mesa no existe");
    }

    // 3) Buscamos la orden más reciente para esa mesa (pending o ready)
    const order = await Order.findOne({
      table: tableDoc._id,
      status: { $in: ["pending", "ready"] },
    })
      .sort({ createdAt: -1 })
      // Poblar para tener name y price de cada producto, y número de mesa
      .populate("items.product", "name price")
      .populate("table", "number")
      .lean();

    if (!order) {
      throw createError(404, "No hay una orden activa para esta mesa");
    }

    // 4) Formatear los items con los datos poblados
    const items = order.items.map((item) => ({
      name: item.product.name,
      qty: item.quantity,
      lineTotal: item.product.price * item.quantity,
    }));

    // 5) Devolvemos la respuesta completa con fecha de creación
    res.json({
      tableNumber: order.table.number,
      createdAt: order.createdAt,
      items,
      total: order.total,
    });
  } catch (err) {
    next(err);
  }
};
/**
 * POST /api/checkout/:tableNumber/pay
 * Marca la orden activa como 'delivered' (pagada).
 */

exports.payOrder = async (req, res, next) => {
  try {
    const tableNumber = parseInt(req.params.tableNumber, 10);
    if (isNaN(tableNumber)) throw createError(400, "Mesa inválida");

    // 1) Busca la mesa por su número
    const tableDoc = await Table.findOne({ number: tableNumber });
    if (!tableDoc) throw createError(404, "La mesa no existe");

    // 2) Marca como 'delivered' la orden más reciente en pending/ready
    const order = await Order.findOneAndUpdate(
      { table: tableDoc._id, status: { $in: ["pending", "ready"] } },
      { status: "delivered", deliveredAt: new Date() },
      {
        new: true, // Devuelve el documento actualizado
        sort: { createdAt: -1 }, // Asegura que sea la orden más reciente
      }
    );

    if (!order) throw createError(404, "No hay orden activa para pagar");

    // 3) Respuesta con la orden actualizada (útil para refrescar UI)
    res.json({
      message: "Orden marcada como pagada.",
      order: {
        id: order._id,
        table: order.table,
        status: order.status,
        deliveredAt: order.deliveredAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
