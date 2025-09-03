import express from "express";
import { sequelize } from "./config/database.js";
import productoRoutes from "./routes/producto.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import cierreRoutes from "./routes/cierre.routes.js";
import path from "path";
import { fileURLToPath } from "url";

import './models/producto.model.js';
import './models/ventas.model.js';
import './models/venta_item.model.js'; 
import './models/cierre.model.js'; 

const app = express();
app.use(express.json());

// 🔥 Necesario para usar __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 Servir carpeta "uploads" como estática
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Sincronizar DB
await sequelize.sync();

// Rutas
app.use("/api", productoRoutes);
app.use("/api", ticketRoutes);
app.use("/api", cierreRoutes);

app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));
