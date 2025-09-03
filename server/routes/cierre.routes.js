import express from "express";
import { realizarCierreCaja, listarCierres, reimprimirCierre } from "../controllers/cierre.controller.js";

const router = express.Router();

router.post("/cierre-caja", realizarCierreCaja);
router.get("/cierres", listarCierres);
router.post("/cierres/:id/reimprimir", reimprimirCierre);

export default router;