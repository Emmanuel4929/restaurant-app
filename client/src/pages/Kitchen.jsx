// src/pages/Kitchen.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import KitchenOrders from "../components/chef/KitchenOrders";
import Layout from "../components/common/Layout";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Kitchen() {
  const { user, socket, token } = useAuth(); //* Obtiene datos del usuario, socket y token desde el hook de autenticación
  //* Estados locales para notificaciones, pedidos, carga y conexión
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  //* 1) Configuración del socket: unirse a la sala "chef" y escuchar nuevos pedidos
  useEffect(() => {
    if (!socket) return;
    setConnected(true);
    socket.emit("joinRoom", "chef");

    //* Maneja la llegada de un nuevo pedido
    const handleNewOrder = (order) => {
      setNotifications((prev) => [
        ...prev,
        `Nuevo pedido de Mesa ${order.table.number}`,
      ]);
      setOrders((prev) => [...prev, order]);
      //* Elimina la notificación después de 5 segundos
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((m) => m !== `Nuevo pedido de Mesa ${order.table.number}`)
        );
      }, 5000);
    };

    socket.on("newOrder", handleNewOrder);
    //* Limpieza al desmontar: salir de la sala y remover listener
    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.emit("leaveRoom", "chef");
    };
  }, [socket]);

  //* 2) Carga inicial de pedidos pendientes desde la API
  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/orders/kitchen`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar pedidos");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  //* 3) Si no hay conexión con el socket, muestra mensaje de espera
  if (!connected) {
    return (
      <Layout title="Cocina: conectando..." notifications={[]}>
        <p className="text-gray-500">Conectando al servidor de pedidos...</p>
      </Layout>
    );
  }

  //* Render principal del componente//* Render principal del componente
  return (
    <Layout
      title={`Cocina: ${user?.name || user?.email || "Chef"}`}
      notifications={notifications}
    >
      {loading ? (
        //* Muestra mensaje mientras se cargan los pedidos
        <div className="text-center p-8 text-gray-500">Cargando pedidos…</div>
      ) : orders.length === 0 ? (
        //* Si no hay pedidos, muestra mensaje y un ícono SVG
        <div className="text-center p-8 text-gray-400">
          /
          <svg
            className="mx-auto mb-4 h-16 w-16 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7h18M3 12h18M3 17h18"
            />
          </svg>
          <p className="text-xl">No hay pedidos pendientes</p>
          <p className="text-sm mt-2">Esperando nuevos encargos…</p>
        </div>
      ) : (
        //* 4) Renderiza el componente KitchenOrders con las órdenes y función para actualizar
        <KitchenOrders orders={orders} setOrders={setOrders} />
      )}
    </Layout>
  );
}
