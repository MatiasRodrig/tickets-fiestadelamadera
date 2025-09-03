import express from "express";
import { sequelize } from "./config/database.js";
import productoRoutes from "./routes/producto.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import cierreRoutes from "./routes/cierre.routes.js";
import usuarioRoutes from './routes/usuario.routes.js';
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

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
app.use("/api", usuarioRoutes);

// --- 👇 DEFENSA Nivel 1: Captura de Excepciones No Controladas ---
// Esto evitará que un error no manejado en CUALQUIER parte de tu código
// mate el servidor. En lugar de crashear, registrará el error.
process.on('uncaughtException', (error) => {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('HUBO UNA EXCEPCIÓN NO CAPTURADA:', error);
    console.error('El servidor seguirá funcionando, pero investiga este error.');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('HUBO UN RECHAZO DE PROMESA NO MANEJADO:', reason);
    console.error('El servidor seguirá funcionando, pero investiga este error.');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
});

app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));
