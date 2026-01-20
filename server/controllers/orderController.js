// server/controllers/orderController.js
const createError = require("http-errors");
const { Order, Table } = require("../models");

/**
 * Crear o actualizar la orden pendiente de una mesa.
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { table, items } = req.body;
    if (!table) throw createError(400, "Falta el identificador de la mesa");
    if (!Array.isArray(items) || items.length === 0) {
      throw createError(400, "Agrega al menos un ítem al pedido");
    }

    // 1) Verificar que la mesa existe
    const tableDoc = await Table.findById(table);
    if (!tableDoc) {
      throw createError(404, "Mesa no encontrada");
    }

    // 2) Validación básica de ítems
    items.forEach((it) => {
      if (!it.product || typeof it.quantity !== "number" || it.quantity < 1) {
        throw createError(400, "Formato de ítems inválido");
      }
    });

    // 3) Buscar si ya hay una orden "pending" para esta mesa
    let order = await Order.findOne({
      table: tableDoc._id,
      status: { $in: ["pending", "ready"] }, // Considerar también "ready" si se quiere actualizar
    });

    if (order) {
      // 3a) Si existe, fusionar los nuevos ítems:
      items.forEach((newItem) => {
        const existing = order.items.find(
          (i) => i.product.toString() === newItem.product
        );
        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          order.items.push(newItem);
        }
      });
    } else {
      // 3b) Si no existe, crear una nueva orden
      order = new Order({ table: tableDoc._id, items });
    }

    // 4) Guardar (el pre-save hook recalcula total y totalCalories)
    await order.save();

    // 5) Re-cargar la orden con populate para devolver al cliente
    const fullOrder = await Order.findById(order._id)
      .populate("items.product", "name price")
      .populate("table", "number");

    // 6) Devolver el objeto completo
    res.status(201).json(fullOrder);

    // 7) Notificar a cocina (emitir socket)
    if (req.io) {
      req.io.to("chef").emit("newOrder", fullOrder);
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Obtener pedidos pendientes para cocina (solo cocineros)
 */
exports.getKitchenOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: "pending" })
      .sort("createdAt")
      // aquí populamos
      .populate("table", "number") // trae solo el campo `number`
      .populate("items.product", "name price"); // trae el campo `name` y `price` de los productos

    // ahora tienes order.table.number y order.items[i].product.name
    return res.json(orders);
  } catch (err) {
    next(err);
  }
};

/**
 * Marcar pedido como listo (solo cocineros)
 */
exports.markOrderReady = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "ready" },
      { new: true }
    )
      .populate("table", "number")
      .populate("items.product", "name price");
    // Verifica si la orden fue encontrada
    if (!order) {
      return next(createError(404, "Pedido no encontrado"));
    }

    return res.json(order);
  } catch (err) {
    next(err);
  }
};
