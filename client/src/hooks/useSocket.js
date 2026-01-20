import { useEffect, useState } from "react";
import { io } from "socket.io-client";

//* URL del servidor de sockets */
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

//* Hook personalizado para gestionar la conexión de Socket.IO */
export const useSocket = () => {
  //* Estados para la instancia del socket y mensajes de pedidos listos */
  const [socket, setSocket] = useState(null);
  const [readyMessage, setReadyMessage] = useState(null);

  //* Efecto: crea la conexión del socket y configura listeners */
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    //* Listener para notificaciones de pedidos listos */
    newSocket.on("orderReadyNotification", (orderId) => {
      setReadyMessage(`¡Pedido ${orderId} está listo para ser entregado!`);
    });
    //* Limpieza al desmontar: desconecta el socket */
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { socket, readyMessage };
};
