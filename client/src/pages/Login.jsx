// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Notification from "../components/common/Notification";
import restaurantLogo from "../assets/restaurant-logo.jpg";

//* URL base de la API desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  //* Hook para navegación y función login desde contexto de autenticación
  const navigate = useNavigate();
  const { login } = useAuth();
  //* Estados locales para email, contraseña, error y carga
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //* Función para manejar el envío del formulario de login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    //* Validación: email y contraseña son requeridos
    if (!email || !password) {
      setError("Email y contraseña son requeridos");
      return;
    }
    setLoading(true);
    try {
      //* Petición al backend para autenticar usuario
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      //* Guarda token y rol en el contexto de autenticación
      login(res.data.token, res.data.user.role);

      // redirige según rol del usuario
      switch (res.data.user.role) {
        case "waiter":
          navigate("/waiter");
          break;
        case "chef":
          navigate("/kitchen");
          break;
        case "cashier":
          navigate("/checkout");
          break;
        case "admin":
          navigate("/admin");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };
  /* Render del formulario de login */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm space-y-6"
      >
        {/* Logo del restaurante */}
        <div className="flex justify-center">
          <img src={restaurantLogo} alt="RestoApp" className="h-16 w-16" />
        </div>
        {/* Título de bienvenida */}
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Bienvenido
        </h2>
        {/* Muestra notificación de error si existe */}
        <Notification message={error} />
        {/* Campos del formulario: email y contraseña */}
        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="tú@correo.com"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="••••••••"
            />
          </label>
        </div>
        {/* Botón de envío del formulario */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
        {/* Enlace para registrarse si no se tiene cuenta */}
        <p className="text-center text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-yellow-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
