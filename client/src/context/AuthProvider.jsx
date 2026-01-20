// src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

//* URL del servidor de sockets
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function AuthProvider({ children }) {
  //* Estado para el token (inicializa leyendo de localStorage)
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  //* Estado para el usuario (intenta decodificar el JWT y recuperar rol)
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    if (savedToken && savedRole) {
      try {
        //* Decodifica el payload del JWT (sin verificar firma) para extraer id y email
        const payload = JSON.parse(atob(savedToken.split(".")[1]));
        return { id: payload.id, email: payload.email, role: savedRole };
      } catch {
        //* Si falla la decodificación, no setea usuario
        return null;
      }
    }
    return null;
  });
  //* Estado para la instancia del socket (conectado según el token)
  const [socket, setSocket] = useState(null);

  //* Efecto: crea y limpia la conexión de Socket.IO cuando cambia el token
  useEffect(() => {
    if (!token) return;
    //* Abre una nueva conexión con autenticación por token
    const newSocket = io(SOCKET_URL, { auth: { token } });
    setSocket(newSocket);
    //* Limpieza al desmontar o cambiar token: desconecta y elimina referencia
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token]);

  //* Función de login: guarda token y rol, actualiza estados y decodifica datos de usuario
  const login = (newToken, role) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", role);
    setToken(newToken);
    try {
      //* Decodifica el payload del JWT para setear id y email
      const payload = JSON.parse(atob(newToken.split(".")[1]));
      setUser({ id: payload.id, email: payload.email, role });
    } catch {
      //* Si falla decodificación, al menos guarda el rol
      setUser({ role });
    }
  };

  //* Función de logout: limpia storage, estados y desconecta el socket
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    setUser(null);
    if (socket) socket.disconnect();
  };

  //* Proveedor del contexto: expone usuario, token, socket y acciones de login/logout
  return (
    <AuthContext.Provider value={{ user, token, socket, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
