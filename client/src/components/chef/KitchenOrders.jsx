// src/components/chef/KitchenOrders.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import Elapsed from "../common/Elapsed";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function KitchenOrders({ initialOrders = [] }) {
  const { token, socket } = useAuth();

  // Si vienen órdenes por props, no cargamos;
  // si no, arrancamos en loading
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(initialOrders.length === 0);

  // Helper estable para actualizar estado
  const updateOrders = useCallback((updater) => {
    setOrders((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!token) return;

    // 1) Carga inicial solo si no recibimos orders por props
    if (initialOrders.length === 0) {
      fetch(`${API_URL}/api/orders/kitchen`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error al cargar pedidos");
          return res.json();
        })
        .then(updateOrders)
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // 2) Escucha nuevos pedidos por WebSocket
    const handleNew = (newOrder) => {
      updateOrders((prev) => {
        // ¿Ya existe esa orden?
        const exists = prev.some((o) => o._id === newOrder._id);
        if (exists) {
          // Reemplaza la vieja por la nueva
          return prev.map((o) => (o._id === newOrder._id ? newOrder : o));
        } else {
          // Añade al final si es completamente nueva
          return [...prev, newOrder];
        }
      });
    };
    socket?.on("newOrder", handleNew);

    return () => {
      socket?.off("newOrder", handleNew);
    };
  }, [token, socket, initialOrders.length, updateOrders]);

  const markReady = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/ready`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo marcar como listo");
      // Notificamos al servidor para que reenvíe a meseros
      socket?.emit("orderReady", orderId);
      // Filtramos la orden lista de la lista local
      updateOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      console.error(err);
    }
  };

  // 3) Estado de carga
  if (loading) {
    return <p className="text-center p-4 text-gray-500">Cargando pedidos…</p>;
  }

  // 4) Placeholder cuando no hay pedidos
  if (orders.length === 0) {
    return (
      <div className="text-center p-8 text-gray-400">
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
    );
  }

  // 5) Renderizado de la lista de pedidos
  return (
    <div className="space-y-4 p-4">
      {orders.map((order) => (
        <div
          key={order._id}
          className="p-4 bg-white rounded shadow flex justify-between items-start"
        >
          <div>
            <p className="font-semibold text-lg flex items-center">
              Mesa {order.table?.number}
              <Elapsed
                timestamp={order.createdAt}
                className="ml-2 text-sm text-gray-500"
              />
            </p>
            <ul className="mt-2 space-y-1">
              {order.items.map((i) => (
                <li key={i.product._id} className="flex justify-between">
                  <span>
                    {i.product.name} x{i.quantity}
                  </span>
                  <span className="font-medium">
                    ${(i.quantity * i.product.price).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => markReady(order._id)}
            className="h-10 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Listo
          </button>
        </div>
      ))}
    </div>
  );
}
