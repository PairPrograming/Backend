const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const routes = require("./routes/index.js");
const uploadRoutes = require("./routes/uploadRoutes"); // Importa las rutas de upload
require("./DbIndex.js"); // Importa solo la inicialización de la base de datos

const server = express();

server.name = "API";

// Configuración de CORS
server.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "backend-production-40d9.up.railway.app/api/salon"],
    credentials: true,
    methods: "GET, POST, OPTIONS, PUT, DELETE",
    allowedHeaders:
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  })
);

// Configuración de express.json() en lugar de bodyParser
server.use(express.json({ limit: "50mb" }));
server.use(cookieParser());
server.use(morgan("dev"));

// Registrar las rutas de upload
server.use("/api/upload", uploadRoutes);

// Registrar las rutas principales
server.use("/", routes);

// Error catching endware.
server.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

module.exports = server;
