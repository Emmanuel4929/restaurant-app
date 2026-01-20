// server/sockets/index.js
const Order = require("../models/Order");

// Configuración de sockets
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Usuario conectado:", socket.id);

    // Unirse a sala por rol
    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`${socket.id} se unió a la sala: ${room}`);
    });

    // Salir de sala
    socket.on("leaveRoom", (room) => {
      socket.leave(room);
      console.log(`${socket.id} salió de la sala: ${room}`);
    });

    // Cuando el mesero coloca la orden, recibe solo el ID y
    // buscamos en BD para poblarla antes de enviar a la cocina
    socket.on("orderPlaced", async (orderData) => {
      try {
        const fullOrder = await Order.findById(orderData._id)
          .populate("table", "number")
          .populate("items.product", "name");
        io.to("chef").emit("newOrder", fullOrder);
        console.log("🏷️ Evento newOrder emitido a chef:", fullOrder);
      } catch (err) {
        console.error("Error al poblar orden para chef:", err);
      }
    });

    // Cocina marca listo → avisamos al mesero con la orden poblada
    socket.on("orderReady", async (orderId) => {
      try {
        const order = await Order.findById(orderId).populate("table", "number");
        io.to("waiter").emit("orderReadyNotification", order);
        console.log(
          "🏷️ Evento orderReadyNotification emitido a waiter:",
          order
        );
      } catch (err) {
        console.error("Error al poblar orden para waiter:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Usuario desconectado:", socket.id);
    });
  });
};
