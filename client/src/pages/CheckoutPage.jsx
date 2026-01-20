// src/pages/CheckoutPage.jsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/common/Layout";
import CheckoutPanel from "../components/cashier/CheckoutPanel";

//* URL base de la API desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CheckoutPage() {
  const { user, token } = useAuth(); //* Obtiene datos del usuario autenticado y token
  //* Estados locales para manejar datos de la orden, errores y notificaciones
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  //* Función para buscar la orden por número de mesa
  const fetchOrderByTable = async (tableNumber) => {
    setError("");
    setOrderData(null);
    //* Validación: si no hay número de mesa, muestra error y notificación
    if (!tableNumber) {
      setError("Por favor ingresa el número de mesa.");
      setNotifications((n) => [...n, "Número de mesa requerido."]);
      setUnreadCount((c) => c + 1);
      return;
    }
    setLoading(true);
    try {
      //* Petición al backend para obtener la orden de la mesa
      const res = await fetch(`${API_URL}/api/checkout/${tableNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      //* Si la respuesta no es OK, lanza error
      if (!res.ok)
        throw new Error(data.message || "Error al obtener la orden.");
      //* Actualiza el estado con los datos de la orden
      setOrderData(data);
    } catch (err) {
      //* Manejo de errores y notificaciones
      setError(err.message);
      setNotifications((n) => [...n, err.message]);
      setUnreadCount((c) => c + 1);
    } finally {
      setLoading(false);
    }
  };

  // Marca todas las notificaciones como leídas
  const handleReadNotifications = () => {
    setUnreadCount(0);
  };
  /* Renderizado del componente */
  return (
    <Layout
      title={`Caja: ${user?.name || user?.email || "Cajero"}`}
      notifications={notifications}
      unreadCount={unreadCount}
      onReadNotifications={handleReadNotifications}
    >
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Facturación</h1>

        {loading ? (
          //* Muestra mensaje de carga mientras se obtiene la orden
          <p className="text-center text-gray-500">Cargando orden…</p>
        ) : (
          //* Componente para gestionar la facturación y mostrar datos de la orden
          <CheckoutPanel
            onFetchOrder={fetchOrderByTable}
            orderData={orderData}
            loading={loading}
            error={error}
            onClearOrder={() => setOrderData(null)}
            token={token} // Pasamos el token para las operaciones de pago
          />
        )}
      </div>
    </Layout>
  );
}
