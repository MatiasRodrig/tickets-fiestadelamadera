import express from "express";
import { register, login } from "../controllers/usuario.controller.js";

const router = express.Router();

// Por ahora dejaremos el registro abierto para crear usuarios de prueba.
// En producción, esta ruta debería estar protegida y solo accesible para administradores.
router.post("/auth/register", register);
router.post("/auth/login", login);

export default router;