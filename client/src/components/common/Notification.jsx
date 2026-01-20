import React from "react";
// Componente para mostrar notificaciones al usuario
const Notification = ({ message }) => {
  if (!message) return null;
  // Estilo simple para la notificación
  return (
    <div className="bg-yellow-100 border border-yellow-500 text-yellow-800 px-4 py-2 rounded mb-4">
      {message}
    </div>
  );
};

export default Notification;
