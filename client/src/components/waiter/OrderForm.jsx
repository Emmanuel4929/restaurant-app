// src/components/waiter/OrderForm.jsx
import { useState, useEffect } from "react";
import MenuItemCard from "../common/MenuItemCard";
import TableSelector from "../common/TableSelector";
import Notification from "../common/Notification";
import { useAuth } from "../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const AUTO_SUCCESS_MS = 5000;

export default function OrderForm() {
  const { token } = useAuth();

  const [menu, setMenu] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState([]);
  // ahora 'table' guardará el ObjectId de la mesa
  const [table, setTable] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ← Aquí insertas el efecto de auto‐dismiss de success:
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), AUTO_SUCCESS_MS);
    return () => clearTimeout(timer);
  }, [success]);

  // 1) Carga inicial del menú
  useEffect(() => {
    if (!token) return;
    const fetchMenu = async () => {
      setLoadingMenu(true);
      try {
        const res = await fetch(`${API_URL}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar el menú.");
        const data = await res.json();
        setMenu(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchMenu();
  }, [token]);

  // 2) Agrupar por categoría
  const groupedMenu = menu.reduce((acc, item) => {
    const cat = item.category || "Sin categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedMenu);

  // 3) Inicializar categoría activa
  useEffect(() => {
    if (categories.length && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // 4) Añadir al carrito
  const handleAdd = (item) => {
    setError("");
    setSuccess("");
    setCart((prev) => {
      const exist = prev.find((i) => i._id === item._id);
      if (exist) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };
  // 4b) Quitar una unidad o eliminar el ítem
  const handleRemove = (itemId) => {
    setCart((prev) =>
      prev
        .map((i) => (i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  // 5) Enviar pedido
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!table || cart.length === 0) {
      setError("Selecciona una mesa y añade al menos un producto.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        // enviamos el _id de la mesa
        table: table,
        // enviamos un arreglo de { product: _id, quantity }
        items: cart.map(({ _id, quantity }) => ({
          product: _id,
          quantity,
        })),
      };
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al crear el pedido.");
      }
      // const newOrder = await res.json();
      //  socket.emit("orderPlaced", { _id: newOrder._id });
      setCart([]);
      setTable("");
      setSuccess("Pedido enviado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 5) Errores o éxito */}
      {(error || success) && <Notification message={error || success} />}

      {/* Selección de mesa */}
      <TableSelector onSelect={setTable} value={table} />

      {/* 6) Tabs de categorías */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1 rounded transition ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 7) Menú filtrado por categoría */}
      <div>
        <h2 className="font-semibold mb-2">{selectedCategory}</h2>
        {loadingMenu ? (
          <p>Cargando menú...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedMenu[selectedCategory]?.map((item) => (
              <MenuItemCard key={item._id} item={item} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </div>

      {/* Carrito */}
      <div>
        <h2 className="font-semibold mb-2">Carrito</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Agrega productos al carrito.</p>
        ) : (
          <ul className="space-y-2">
            {cart.map((item) => (
              <li
                key={item._id}
                className="flex justify-between items-center space-x-4"
              >
                <div className="flex-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-2 text-gray-600">x {item.quantity}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Botón para quitar una unidad */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    –
                  </button>
                  {/* Botón para añadir una unidad */}
                  <button
                    type="button"
                    onClick={() => handleAdd(item)}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    +
                  </button>
                </div>
                <div className="w-20 text-right font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Enviar pedido */}
      <button
        type="submit"
        disabled={submitting}
        className={`w-full px-4 py-2 rounded text-white transition ${
          submitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {submitting ? "Enviando…" : "Enviar Pedido"}
      </button>
    </form>
  );
}
