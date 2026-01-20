// src/pages/Waiter.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Notification from "../components/common/Notification";
import OrderForm from "../components/waiter/OrderForm";
import Layout from "../components/common/Layout";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Waiter() {
  const { user, socket } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tables, setTables] = useState([]);
  const [connected, setConnected] = useState(false);

  // al principio del componente
  const clearNotifications = () => setNotifications([]);

  useEffect(() => {
    if (!socket) return;
    setConnected(true);
    socket.emit("joinRoom", "waiter");

    const handleOrderReady = (order) => {
      // order es el objeto completo poblado
      const message = `Pedido ${order._id} de Mesa ${order.table.number} está listo`;
      setNotifications((prev) => [...prev, message]);
      setUnreadCount((c) => c + 1); // incrementamos no leídas
      // Programamos limpieza de esta notificación
    };
    socket.on("orderReadyNotification", handleOrderReady);

    return () => {
      socket.off("orderReadyNotification", handleOrderReady);
      socket.emit("leaveRoom", "waiter");
      // Limpiar todos los timers
    };
  }, [socket]);

  useEffect(() => {
    if (!connected) return;
    const loadTables = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/api/tables`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar mesas");
        const data = await res.json();
        setTables(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadTables();
  }, [connected]);

  if (!connected) {
    return (
      <Layout title="Mesero: conectando..." notifications={[]}>
        <p className="text-gray-500">Conectando al servidor de pedidos...</p>
      </Layout>
    );
  }
  // Función que se pasa al Layout para marcar notificaciones como leídas
  const markAllRead = () => setUnreadCount(0);

  return (
    <Layout
      title={`Mesero: ${user?.name || user?.email || "Usuario"}`}
      notifications={notifications}
      unreadCount={unreadCount}
      onReadNotifications={markAllRead}
      onClearNotifications={clearNotifications}
    >
      {/* Mostrar total de mesas */}
      <div className="mb-6 p-4 bg-white bg-opacity-90 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Mesas ({tables.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {tables.map((t) => (
            <div
              key={t._id}
              className={`p-2 rounded text-center ${
                t.status === "occupied"
                  ? "bg-red-200 text-red-800"
                  : "bg-green-200 text-green-800"
              }`}
            >
              Mesa {t.number}
            </div>
          ))}
        </div>
      </div>

      {/* Notificaciones en contenido */}
      {notifications.map((msg, idx) => (
        <Notification key={idx} message={msg} />
      ))}

      {/* Formulario */}
      <OrderForm />
    </Layout>
  );
}
