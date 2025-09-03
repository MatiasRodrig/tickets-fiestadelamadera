import VentaItem from "../models/venta_item.model.js";
import Cierre from "../models/cierre.model.js";
import { sequelize } from "../config/database.js";
import { imprimirTickets } from "../imprimirTicket.js";
import { Op, Transaction } from 'sequelize'; // 👈 Asegúrate de importar Transaction

export const realizarCierreCaja = async (req, res) => {
    // 👇 Usamos la transacción 'IMMEDIATE' por consistencia y seguridad.
    const t = await sequelize.transaction({ type: Transaction.TYPES.IMMEDIATE });

    try {
        // --- PASO 1: LÓGICA DE BASE DE DATOS ---
        const ventasSinCerrar = await VentaItem.findAll({
            where: { cierre_id: { [Op.is]: null } },
            transaction: t
        });

        if (ventasSinCerrar.length === 0) {
            // No necesitamos un rollback si no hay ventas.
            // Es importante hacer rollback aquí de la transacción iniciada.
            await t.rollback();
            return res.status(400).json({ ok: false, mensaje: "No hay ventas pendientes para cerrar." });
        }

        let totalGeneral = 0;
        const detalle = {};
        for (const venta of ventasSinCerrar) {
            totalGeneral += venta.total;
            if (detalle[venta.nombre]) {
                detalle[venta.nombre].cantidad += venta.cantidad;
                detalle[venta.nombre].total += venta.total;
            } else {
                detalle[venta.nombre] = { cantidad: venta.cantidad, total: venta.total };
            }
        }

        const nuevoCierre = await Cierre.create({
            total_vendido: totalGeneral,
            detalle: detalle
        }, { transaction: t });

        const idsVentas = ventasSinCerrar.map(v => v.id);
        await VentaItem.update(
            { cierre_id: nuevoCierre.id },
            { where: { id: idsVentas }, transaction: t }
        );

        // --- PASO 2: CONFIRMAR LA OPERACIÓN EN LA BASE DE DATOS ---
        await t.commit();
        console.log("Transacción de CIERRE DE CAJA confirmada (COMMIT). El cierre está guardado.");

        // --- PASO 3: INTENTAR IMPRIMIR (operación no crítica) ---
        // Preparar el ticket aquí, fuera de la lógica de la BD.
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

        try {
            await imprimirTickets([textoTicket]);
            res.json({
                ok: true,
                mensaje: "Cierre de caja realizado e ticket enviado a imprimir.",
                cierre: nuevoCierre
            });
        } catch (printError) {
            console.error("EL CIERRE FUE GUARDADO, PERO LA IMPRESIÓN FALLÓ:", printError);
            res.status(207).json({ // 207 Multi-Status
                ok: true,
                mensaje: "¡Cierre de caja guardado con éxito, pero hubo un error al imprimir el ticket!",
                cierre: nuevoCierre
            });
        }

    } catch (dbError) {
        // Este bloque solo se ejecutará si hay un error DURANTE la transacción.
        await t.rollback();
        console.error("Error al cerrar la caja (DB):", dbError);
        res.status(500).json({ ok: false, mensaje: "Error interno al procesar el cierre de caja." });
    }
};


export const listarCierres = async (req, res) => {
    try {
        const cierres = await Cierre.findAll({
            order: [['fecha_cierre', 'DESC']] // Ordenar del más reciente al más antiguo
        });
        res.json(cierres);
    } catch (error) {
        console.error("Error al listar los cierres:", error);
        res.status(500).json({ ok: false, mensaje: "Error al obtener el historial de cierres." });
    }
};


// --- 👇 NUEVA FUNCIÓN PARA REIMPRIMIR UN CIERRE ---
export const reimprimirCierre = async (req, res) => {
    try {
        const { id } = req.params;
        const cierre = await Cierre.findByPk(id);

        if (!cierre) {
            return res.status(404).json({ ok: false, mensaje: "Cierre no encontrado." });
        }

        const { detalle, total_vendido, fecha_cierre } = cierre;

        // Reconstruimos el texto del ticket a partir de los datos guardados
        let textoTicket = "========= REIMPRESIÓN CIERRE DE CAJA =========\n";
        textoTicket += `Fecha Original: ${new Date(fecha_cierre).toLocaleString()}\n`;
        textoTicket += "--------------------------------\n\n";
        textoTicket += "RESUMEN POR PRODUCTO\n";

        Object.keys(detalle).forEach(nombre => {
            const prod = detalle[nombre];
            textoTicket += `${nombre.padEnd(15)} x${prod.cantidad}   $${prod.total.toFixed(2)}\n`;
        });

        textoTicket += "\n--------------------------------\n";
        textoTicket += `TOTAL GENERAL: $${total_vendido.toFixed(2)}\n`;
        textoTicket += "--------------------------------\n";

        await imprimirTickets([textoTicket]);

        res.json({ ok: true, mensaje: "Reimpresión del cierre enviada a la impresora." });

    } catch (error) {
        console.error("Error al reimprimir el cierre:", error);
        res.status(500).json({ ok: false, mensaje: "Error interno al reimprimir el ticket." });
    }
};