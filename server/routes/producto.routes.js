import express from "express";
import upload from "../middlewares/upload.js";
import {
  crearProducto,
  listarProductos,
  actualizarProducto,
  eliminarProducto,
} from "../controllers/producto.controller.js";

const router = express.Router();

router.post("/productos", upload.single("imagen"), crearProducto); // Añadir middleware de multer
router.get("/productos", listarProductos);
router.put("/productos/:id", actualizarProducto);
router.delete("/productos/:id", eliminarProducto);

export default router;
