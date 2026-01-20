// src/components/cashier/CheckoutPanel.jsx
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Notification from "../common/Notification";
import Elapsed from "../common/Elapsed";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CheckoutPanel({
  onFetchOrder,
  orderData,
  loading,
  error,
  onClearOrder, // Limpia la orden en el componente padre
}) {
  const [tableNumber, setTableNumber] = useState("");
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState("");
  const { token } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    onFetchOrder(tableNumber);
  };

  const handlePay = async () => {
    setPaying(true);
    setSuccess("");
    try {
      const res = await fetch(
        `${API_URL}/api/checkout/${orderData.tableNumber}/pay`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("🔔 Pay response status:", res.status);
      if (!res.ok) {
        const text = await res.text();
        console.error("🔴 Pay failed body:", text);
        throw new Error(text || "Error al marcar pagado");
      }

      // Si todo va bien:
      setSuccess("Pago realizado correctamente.");
      onClearOrder();
      setTableNumber("");
    } catch (err) {
      console.error("🔴 handlePay error:", err);
      // Podrías mostrar también en Notification:
      setSuccess(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="bg-white shadow rounded p-6 space-y-6">
      {/* Formulario de búsqueda */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          placeholder="Número de mesa"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {/* Error de búsqueda */}
      {error && <Notification message={error} type="error" />}

      {/* Notificación de éxito de pago */}
      {success && <Notification message={success} />}

      {/* Datos de la orden */}
      {orderData ? (
        <div className="space-y-4">
          {/* Cabecera con timestamp */}
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-semibold">
              Orden Mesa {orderData.tableNumber}
            </h2>
            <Elapsed timestamp={orderData.createdAt} />
          </div>

          {/* Lista de ítems */}
          <ul className="space-y-1">
            {orderData.items.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>
                  {item.name} x {item.qty}
                </span>
                <span>${item.lineTotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>

          {/* Total */}
          <div className="flex justify-between items-center font-bold">
            <span>Total a pagar:</span>
            <span>${orderData.total.toFixed(2)}</span>
          </div>

          {/* Botón de pagar */}
          <button
            onClick={handlePay}
            disabled={paying}
            className={`w-full px-4 py-2 rounded text-white transition ${
              paying
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {paying ? "Procesando pago…" : "Marcar como pagado"}
          </button>
        </div>
      ) : (
        <p className="text-gray-500">
          Ingresa un número de mesa para comenzar.
        </p>
      )}
    </div>
  );
}
