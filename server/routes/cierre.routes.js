import express from "express";
import { realizarCierreCaja } from "../controllers/cierre.controller.js";

const router = express.Router();

router.post("/cierre-caja", realizarCierreCaja);

export default router;