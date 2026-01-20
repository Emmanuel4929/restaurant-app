// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/common/Layout";
import axios from "axios";

//URL base para la API, obtenida desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Componente principal de panel de administración
export default function AdminDashboard() {
  // Extrae el usuario y el token desde el contexto de autenticación
  const { user, token } = useAuth();
  // Estados para almacenar datos del backend
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [tables, setTables] = useState([]);
  // Estado para el formulario de creación de producto
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    calories: "",
    category: "",
  });
  // Estado para el número de nueva mesa
  const [newTableNumber, setNewTableNumber] = useState("");
  // Estado para notificaciones (mensajes de éxito/error)
  const [notifications, setNotifications] = useState([]);
  // Estados para mostrar indicadores de carga
  const [prodLoading, setProdLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  //Carga inicial de datos (productos, usuarios y mesas)
  // Se ejecuta cuando el token está disponible.
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodRes, userRes, tableRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/products`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/admin/tables`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        // Actualiza los estados con los datos obtenidos
        setProducts(prodRes.data);
        setUsers(userRes.data);
        setTables(tableRes.data);
      } catch (err) {
        // Agrega mensaje de error a las notificaciones
        setNotifications((prev) => [
          ...prev,
          err.response?.data?.message || err.message,
        ]);
      }
    };
    if (token) fetchAll();
  }, [token]);

  /**
   * Auto-elimina la primera notificación después de 6 segundos
   * Evita acumulación excesiva de mensajes en pantalla.
   */

  useEffect(() => {
    if (!notifications.length) return;
    const timer = setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 6000);
    return () => clearTimeout(timer);
  }, [notifications]);

  /**
   * Maneja la creación de un nuevo producto
   * Valida y transforma datos antes de enviarlos (parseFloat, parseInt)
   */

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setProdLoading(true);
    try {
      const payload = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        calories: parseInt(newProduct.calories, 10),
        category: newProduct.category,
      };
      const res = await axios.post(`${API_URL}/api/admin/products`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Actualiza lista de productos y resetea formulario
      setProducts((prev) => [...prev, res.data]);
      setNewProduct({
        name: "",
        price: "",
        description: "",
        calories: "",
        category: "",
      });
      setNotifications((prev) => [...prev, "Producto creado correctamente."]);
    } catch (err) {
      setNotifications((prev) => [
        ...prev,
        err.response?.data?.message || err.message,
      ]);
    } finally {
      setProdLoading(false);
    }
  };

  /**
   * Maneja la eliminación de un producto por ID
   * Actualiza el estado local para reflejar el cambio sin recargar la página.
   */

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setNotifications((prev) => [...prev, "Producto eliminado."]);
    } catch (err) {
      setNotifications((prev) => [
        ...prev,
        err.response?.data?.message || err.message,
      ]);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setNotifications((prev) => [...prev, "Usuario eliminado."]);
    } catch (err) {
      setNotifications((prev) => [
        ...prev,
        err.response?.data?.message || err.message,
      ]);
    }
  };

  // Función para crear una mesa en el backend y actualizar el estado local
  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTableNumber) return;
    setTableLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/admin/tables`,
        { number: Number(newTableNumber), status: "available" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTables((prev) => [...prev, res.data]);
      setNewTableNumber("");
      setNotifications((prev) => [...prev, "Mesa creada correctamente."]);
    } catch (err) {
      setNotifications((prev) => [
        ...prev,
        err.response?.data?.message || err.message,
      ]);
    } finally {
      setTableLoading(false);
    }
  };

  //* Función para eliminar una mesa en el backend y actualizar la lista local
  const handleDeleteTable = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/tables/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables((prev) => prev.filter((t) => t._id !== id));
      setNotifications((prev) => [...prev, "Mesa eliminada."]);
    } catch (err) {
      setNotifications((prev) => [
        ...prev,
        err.response?.data?.message || err.message,
      ]);
    }
  };
  //layout principal con título y notificaciones
  return (
    <Layout
      title={`Admin: ${user?.name || user?.email}`}
      notifications={notifications}
    >
      <div className="p-4 space-y-6">
        {/*Sección para crear un nuevo producto con formulario*/}
        <details open className="bg-white bg-opacity-80 rounded shadow p-4">
          <summary className="cursor-pointer font-semibold text-lg mb-2">
            Crear nuevo producto
          </summary>
          <form onSubmit={handleCreateProduct} className="space-y-2 mt-2">
            //* Campo para nombre del producto */
            <input
              type="text"
              placeholder="Nombre"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full p-2 border rounded"
              required
            />
            //* Campo para precio del producto */
            <input
              type="number"
              step="0.01"
              placeholder="Precio"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, price: e.target.value }))
              }
              className="w-full p-2 border rounded"
              required
            />
            //* Selector de categoría del producto
            <select
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Selecciona categoría</option>
              {[
                "Entradas",
                "Hamburguesas",
                "HotDogs",
                "Bebidas",
                "Licores",
                "Especiales",
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            //* Campo para descripción del producto
            <input
              type="text"
              placeholder="Descripción"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            />
            //* Campo para calorías del producto
            <input
              type="number"
              placeholder="Calorías"
              value={newProduct.calories}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, calories: e.target.value }))
              }
              className="w-full p-2 border rounded"
              required
            />
            //* Botón para enviar el formulario y crear el producto
            <button
              type="submit"
              disabled={prodLoading}
              className={`px-4 py-2 rounded text-white transition ${
                prodLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {prodLoading ? "Creando..." : "Crear Producto"}
            </button>
          </form>
        </details>

        {/* Sección para listar productos existentes con opción de eliminar */}
        <details className="bg-white bg-opacity-80 rounded shadow p-4">
          <summary className="cursor-pointer font-semibold text-lg mb-2">
            Productos Existentes
          </summary>
          <div className="mt-2 space-y-2">
            {products.length === 0 ? (
              //* Mensaje cuando no hay productos
              <p className="text-gray-500">No hay productos.</p>
            ) : (
              //* Renderiza cada producto con botón para eliminar
              products.map((p) => (
                <div
                  key={p._id}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <span>
                    <strong>[{p.category}]</strong> {p.name} – $
                    {p.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteProduct(p._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>
        </details>

        {/*  Sección para listar usuarios con opción de eliminar */}
        <details className="bg-white bg-opacity-80 rounded shadow p-4">
          <summary className="cursor-pointer font-semibold text-lg mb-2">
            Usuarios
          </summary>
          <div className="mt-2 space-y-2">
            {users.length === 0 ? (
              //* Mensaje cuando no hay usuarios
              <p className="text-gray-500">No hay usuarios.</p>
            ) : (
              //* Renderiza cada usuario con botón para eliminar
              users.map((u) => (
                <div
                  key={u._id}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <span>
                    {u.email} ({u.role})
                  </span>
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>
        </details>

        {/*  Sección para gestionar mesas: crear nuevas y listar existentes */}
        <details className="bg-white bg-opacity-80 rounded shadow p-4">
          <summary className="cursor-pointer font-semibold text-lg mb-2">
            Mesas
          </summary>
          <div className="mt-2 space-y-2">
            //* Formulario para crear una nueva mesa
            <form onSubmit={handleCreateTable} className="flex gap-2">
              <input
                type="number"
                placeholder="Número de mesa"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                className="flex-1 p-2 border rounded"
                required
              />
              <button
                type="submit"
                disabled={tableLoading}
                className={`px-4 py-2 rounded text-white transition ${
                  tableLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {tableLoading ? "Creando..." : "Crear Mesa"}
              </button>
            </form>
            {tables.length === 0 ? (
              //* Mensaje cuando no hay mesas
              <p className="text-gray-500">No hay mesas.</p>
            ) : (
              //* Muestra cada mesa con botón para eliminar
              tables.map((t) => (
                <div
                  key={t._id}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <span>
                    Mesa {t.number} ({t.status})
                  </span>
                  <button
                    onClick={() => handleDeleteTable(t._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>
        </details>
      </div>
    </Layout>
  );
}
