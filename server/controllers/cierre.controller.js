import VentaItem from "../models/venta_item.model.js";
import Cierre from "../models/cierre.model.js";
import { sequelize } from "../config/database.js";
import { imprimirTickets } from "../imprimirTicket.js";
import { Op } from 'sequelize';

export const realizarCierreCaja = async (req, res) => {
    const t = await sequelize.transaction(); // Iniciar una transacción
    try {
        // 1. Encontrar todas las ventas que no han sido cerradas
        const ventasSinCerrar = await VentaItem.findAll({
            where: { cierre_id: { [Op.is]: null } },
            transaction: t
        });

        if (ventasSinCerrar.length === 0) {
            return res.status(400).json({ ok: false, mensaje: "No hay ventas para cerrar." });
        }

        // 2. Calcular totales y agrupar por producto
        let totalGeneral = 0;
        const detalle = {}; // { 'Producto A': { cantidad: 10, total: 1000 }, ... }

        for (const venta of ventasSinCerrar) {
            totalGeneral += venta.total;
            if (detalle[venta.nombre]) {
                detalle[venta.nombre].cantidad += venta.cantidad;
                detalle[venta.nombre].total += venta.total;
            } else {
                detalle[venta.nombre] = {
                    cantidad: venta.cantidad,
                    total: venta.total
                };
            }
        }

        // 3. Crear el registro del cierre
        const nuevoCierre = await Cierre.create({
            total_vendido: totalGeneral,
            detalle: detalle
        }, { transaction: t });

        // 4. Actualizar los items de venta con el ID del nuevo cierre
        const idsVentas = ventasSinCerrar.map(v => v.id);
        await VentaItem.update(
            { cierre_id: nuevoCierre.id },
            { where: { id: idsVentas }, transaction: t }
        );

        // 5. Preparar e imprimir el ticket de cierre
        let textoTicket = "========= CIERRE DE CAJA =========\n";
        textoTicket += `Fecha: ${new Date().toLocaleString()}\n`;
        textoTicket += "--------------------------------\n\n";
        textoTicket += "RESUMEN POR PRODUCTO\n";

        Object.keys(detalle).forEach(nombre => {
            const prod = detalle[nombre];
            textoTicket += `${nombre.padEnd(15)} x${prod.cantidad}   $${prod.total.toFixed(2)}\n`;
        });

        textoTicket += "\n--------------------------------\n";
        textoTicket += `TOTAL GENERAL: $${totalGeneral.toFixed(2)}\n`;
        textoTicket += "--------------------------------\n";

        await imprimirTickets([textoTicket]); // Usamos la misma función de imprimir

        // Si todo va bien, confirmamos la transacción
        await t.commit();

        res.json({
            ok: true,
            mensaje: "Cierre de caja realizado con éxito.",
            cierre: nuevoCierre
        });

    } catch (error) {
        // Si hay un error, revertimos todo
        await t.rollback();
        console.error("Error al cerrar la caja:", error);
        res.status(500).json({ ok: false, mensaje: "Error interno al cerrar la caja." });
    }
};