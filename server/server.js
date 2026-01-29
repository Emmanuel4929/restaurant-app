// server/server.js
// Carga de variables de entorno
// Desde el archivo .env, como la URL del frontend, puerto, y URI de MongoDB.
require("dotenv").config();

const express = require("express"); // framework para crear el servidor web.
const mongoose = require("mongoose"); // conexión y manejo de MongoDB.
const cors = require("cors"); // permite peticiones desde otros dominios (el frontend).
const helmet = require("helmet"); // mejora la seguridad HTTP.
const rateLimit = require("express-rate-limit"); // limita el número de peticiones por IP.
const http = require("http"); // para crear el servidor HTTP.
const socketHandler = require("./sockets"); // lógica personalizada para manejar WebSockets.

const app = express();

// Esto le dice a Express que confíe en Render (un proxy)
app.set("trust proxy", 1);

// 1) Seguridad y parsing
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Endpoint de salud

// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
const stateIdx = require("mongoose").connection.readyState ?? 0;
res.json({
  status: "ok",
  db: dbStates[stateIdx] || "unknown",
  time: new Date().toISOString(),
});

// 2) Limita a 100 peticiones cada 15 minutos por IP para evitar abusos o ataques.

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: "Demasiadas peticiones, vuelve a intentarlo más tarde",
});
app.use("/api/", apiLimiter);

// 3) Se crea el servidor HTTP y se configura Socket.IO para comunicación en tiempo real ( actualizaciones de órdenes ).
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: process.env.FRONTEND_URL },
});

// 4) Inyectar io en cada petición
// Permite acceder a io (WebSocket) desde cualquier ruta o controlador.
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 5) Conectar a MongoDB
// Conecta la app a la base de datos MongoDB Atlas usando la URI definida en .env.
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error de conexión a MongoDB:", err));

// 6) Ahora sí, montar tus rutas de la API
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/product"));
app.use("/api/tables", require("./routes/table"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/checkout", require("./routes/checkout"));
app.use("/api/admin", require("./routes/admin"));

// 7) Inicializar la lógica de sockets
// Se activa la lógica de WebSocket para manejar eventos en tiempo real (como cambios en órdenes o mesas).
socketHandler(io);

// 8) Middleware global de errores
// Captura errores no manejados y devuelve una respuesta JSON con el mensaje de error.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
});

// 9) Arrancar el servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
