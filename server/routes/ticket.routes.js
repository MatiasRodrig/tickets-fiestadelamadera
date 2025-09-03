import express from "express";
import {listarVentas, registrarVenta } from "../controllers/ticket.controller.js";

const router = express.Router();

router.post("/imprimir", registrarVenta);
router.get("/ventas", listarVentas);

export default router;
