// src/components/common/Layout.jsx

//* Importación de hooks y utilidades
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

//* Importar imágenes desde src/assets (Vite las procesa y genera URLs válidas en producción)
import logo from "../../assets/restaurant-logo.jpg";
import restbg from "../../assets/rest-bg.jpg"; // <-- usa .jpeg si así se llama tu archivo

//* Botón de logout
function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}

//* Navbar común con links según rol y campana de notificaciones
function Navbar({
  notifications = [],
  unreadCount = 0,
  onReadNotifications = () => {},
  onClearNotifications = () => {},
}) {
  const { user } = useAuth();
  const role = user?.role;
  const [showNotif, setShowNotif] = useState(false);
  const [dismissTimer, setDismissTimer] = useState(null);

  const navItems = [];
  if (role === "waiter") navItems.push({ to: "/waiter", label: "Mesero" });
  if (role === "chef") navItems.push({ to: "/kitchen", label: "Cocina" });
  if (role === "cashier") navItems.push({ to: "/checkout", label: "Caja" });
  if (role === "admin") navItems.push({ to: "/admin", label: "Admin" });

  const handleBell = () => {
    const next = !showNotif;
    setShowNotif(next);
    if (next) {
      onReadNotifications(); // marcamos como leídas
      if (dismissTimer) clearTimeout(dismissTimer);
      const t = setTimeout(() => {
        onClearNotifications();
      }, 5000);
      setDismissTimer(t);
    } else {
      if (dismissTimer) {
        clearTimeout(dismissTimer);
        setDismissTimer(null);
      }
    }
  };

  return (
    <header className="flex items-center justify-between bg-white bg-opacity-75 backdrop-blur p-4 shadow-md relative z-50">
      <div className="flex items-center">
        <img src={logo} alt="RestoApp" className="h-8 w-8 mr-2" />
        <span className="text-2xl font-bold text-gray-800">
          Panel Principal
        </span>
      </div>
      <nav className="flex items-center space-x-4 relative">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="text-gray-700 hover:text-gray-900 transition"
          >
            {item.label}
          </Link>
        ))}
        {/* Icono de campana */}
        <div className="relative">
          <button
            type="button"
            onClick={handleBell}
            className="relative focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700 hover:text-gray-900 transition"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded p-2 z-50">
              <h4 className="font-semibold mb-2">Notificaciones</h4>
              {notifications.length === 0 ? (
                <p className="text-gray-500">Sin notificaciones</p>
              ) : (
                notifications.map((msg, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-gray-800 border-b last:border-none py-1"
                  >
                    {msg}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <LogoutButton />
      </nav>
    </header>
  );
}

//* Layout principal con imagen de fondo (usando import desde src/assets)
export default function Layout({
  children,
  notifications,
  unreadCount,
  onReadNotifications,
  onClearNotifications,
}) {
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${restbg})`, // ✅ Vite reemplaza por la URL final en build
      }}
    >
      <Navbar
        notifications={notifications}
        unreadCount={unreadCount}
        onReadNotifications={onReadNotifications}
        onClearNotifications={onClearNotifications}
      />
      <main className="p-6 bg-white bg-opacity-80 backdrop-blur-lg mx-auto max-w-7xl rounded-lg mt-6 relative z-40">
        {children}
      </main>
    </div>
  );
}
