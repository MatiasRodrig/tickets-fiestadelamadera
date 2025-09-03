import express from "express";
import { listarVentas, registrarVenta, registrarVentaCarrito, listarVentasItems } from "../controllers/ticket.controller.js";

const router = express.Router();

router.post("/imprimir", registrarVenta);
router.get("/ventas", listarVentas);
router.get("/ventas/items", listarVentasItems);
router.post("/checkout", registrarVentaCarrito);


export default router;
