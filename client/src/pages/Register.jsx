// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Notification from "../components/common/Notification";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Register() {
  const navigate = useNavigate(); //* Hook para navegación */
  //* Estados locales para campos del formulario, error y carga
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("waiter");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //* Función para manejar el envío del formulario de registro
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    //* Validación: todos los campos son obligatorios
    if (!name || !email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }
    setLoading(true);
    try {
      //* Petición al backend para registrar nuevo usuario con rol seleccionado
      await axios.post(
        `${API_URL}/api/auth/register`,
        { name, email, password, role },
        { headers: { "Content-Type": "application/json" } }
      );
      /* Alerta de éxito y redirección a login */
      alert("Registro exitoso. Por favor, inicia sesión.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };
  /* Render del formulario de registro */
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #FDECF7 0%, #FFF3D4 100%)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 rounded-lg shadow-lg bg-white bg-opacity-80 backdrop-blur"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Crear nueva cuenta
        </h2>

        <Notification message={error} />

        <label className="block mb-2">
          <span className="text-gray-700">Nombre completo</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded mt-1 focus:ring focus:ring-pink-200"
            placeholder="Tu nombre"
          />
        </label>

        <label className="block mb-2">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mt-1 focus:ring focus:ring-pink-200"
            placeholder="correo@ejemplo.com"
          />
        </label>

        <label className="block mb-2">
          <span className="text-gray-700">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mt-1 focus:ring focus:ring-pink-200"
            placeholder="••••••••"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Rol</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded mt-1 focus:ring focus:ring-pink-200"
          >
            <option value="waiter">Mesero</option>
            <option value="chef">Cocinero</option>
            <option value="cashier">Cajero</option>
            <option value="admin">Administrador</option>
          </select>
        </label>

        <button
          type="submit"
          className={`w-full p-2 rounded text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-pink-500 hover:bg-pink-600"
          }`}
          disabled={loading}
        >
          {loading ? "Registrando..." : "Registrar"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-700">
          ¿Ya tienes cuenta?{" "}
          <Link to="/" className="text-pink-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
