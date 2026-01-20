// src/components/common/TableSelector.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

//* URL base de la API desde variables de entorno */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function TableSelector({ onSelect, value }) {
  //* Obtiene el token del usuario autenticado
  const { token } = useAuth();
  //* Estados locales: lista de mesas y mensaje de error
  const [tables, setTables] = useState([]);
  const [error, setError] = useState("");

  //* Carga las mesas desde la API cuando hay token
  useEffect(() => {
    if (!token) return;
    //* Función auxiliar para obtener mesas del backend
    const loadTables = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tables`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar mesas");
        const data = await res.json();
        setTables(data);
      } catch (err) {
        setError(err.message);
      }
    };
    loadTables();
  }, [token]);

  //* Maneja el cambio en el selector y envía el _id seleccionado al padre
  const handleChange = (e) => {
    onSelect(e.target.value);
  };

  //* Render del selector de mesas con manejo de errores
  return (
    <div className="mb-4">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <label className="block mb-1 font-semibold text-gray-700">Mesa:</label>
      {/* Selector de mesas */}
      <select
        value={value}
        onChange={handleChange}
        className="w-full p-2 border rounded bg-white"
      >
        <option value="">-- Selecciona mesa --</option>
        {tables.map((t) => (
          // Enviamos t._id para que el cliente use el ObjectId
          <option key={t._id} value={t._id}>
            Mesa {t.number} {t.status === "occupied" ? "(Ocupada)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
