import Producto from "../models/producto.model.js";
import Venta from "../models/ventas.model.js";
import VentaItem from "../models/venta_item.model.js";
import { imprimirTickets } from "../imprimirTicket.js";
import { sequelize } from "../config/database.js";
import { Transaction } from "sequelize";


export const registrarVenta = async (req, res) => {
  try {
    const { id, cantidad } = req.body;
    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ ok: false, mensaje: "Producto no encontrado" });
    }

    // Buscar si ya existe una venta con ese producto
    let venta = await Venta.findOne({ where: { nombre: producto.nombre } });

    if (venta) {
      // sumamos al total
      venta.total += producto.precio * cantidad;
      await venta.save();
    } else {
      // si no existe, creamos el registro
      venta = await Venta.create({
        nombre: producto.nombre,
        cantidad: cantidad,
        total: producto.precio * cantidad
      });
    }

    await VentaItem.create({
      nombre: producto.nombre,
      cantidad: cantidad,
      precio_unitario: producto.precio,
      total: producto.precio * cantidad,
      cierre_id: null // Aún no pertenece a ningún cierre
    });

    // Armar tickets
    const textos = [];
    for (let i = 0; i < cantidad; i++) {
      let texto = "========= FIESTA NACIONAL DE LA MADERA =========\n";
      texto += "Ticket de compra\n\n";
      texto += `Producto   ${producto.nombre.padEnd(12, " ")}\n`;
      texto += "--------------------------\n";
      texto += `Precio  ${producto.precio}\n`;
      texto += "--------------------------\n";
      texto += `\n`;
      texto += "Gracias por su compra!\n\n";
      textos.push(texto);
    }

    await imprimirTickets(textos);

    res.json({
      ok: true,
      mensaje: "Venta registrada e impresión enviada",
      venta
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: "Error al registrar la venta" });
  }
};


export const registrarVentaCarrito = async (req, res) => {
  const { cart } = req.body;
  if (!cart || cart.length === 0) {
    return res.status(400).json({ ok: false, mensaje: "El carrito está vacío." });
  }

  const t = await sequelize.transaction({ type: Transaction.TYPES.IMMEDIATE });
  const todosLosTextos = [];

  try {
    // --- PASO 1: LÓGICA DE BASE DE DATOS ---
    for (const item of cart) {
      const producto = await Producto.findByPk(item.id, { transaction: t });
      if (!producto) throw new Error(`Producto con ID ${item.id} no encontrado.`);

      const cantidad = item.cantidad;
      const totalItem = producto.precio * cantidad;

      const [venta] = await Venta.findOrCreate({
        where: { nombre: producto.nombre },
        defaults: { total: 0 },
        transaction: t
      });
      venta.total += totalItem;
      await venta.save({ transaction: t });

      await VentaItem.create({
        nombre: producto.nombre,
        cantidad: cantidad,
        precio_unitario: producto.precio,
        total: totalItem,
        cierre_id: null
      }, { transaction: t });

      for (let i = 0; i < cantidad; i++) {
        let texto = "========= FIESTA NACIONAL DE LA MADERA =========\n";
        // ... (construcción del texto del ticket)
        texto += `Producto   ${producto.nombre.padEnd(12, " ")}\n`;
        texto += "--------------------------\n";
        texto += `Precio  ${producto.precio}\n`;
        texto += "--------------------------\n\n";
        texto += "Gracias por su compra!\n\n";
        todosLosTextos.push(texto);
      }
    }

    // --- PASO 2: CONFIRMAR LA VENTA EN LA BASE DE DATOS ---
    // [CAMBIO CRÍTICO] Hacemos commit ANTES de intentar imprimir.
    await t.commit();
    console.log("Transacción de base de datos confirmada (COMMIT). La venta está guardada.");

    // --- PASO 3: INTENTAR IMPRIMIR (operación no crítica) ---
    try {
      if (todosLosTextos.length > 0) {
        await imprimirTickets(todosLosTextos);
      }
      // Si la impresión fue exitosa, enviamos la respuesta final.
      res.json({
        ok: true,
        mensaje: "Compra registrada y todos los tickets enviados a imprimir.",
      });
    } catch (printError) {
      // Si la impresión falló, la venta ya está guardada.
      // Registramos el error en el servidor y avisamos al cliente.
      console.error("LA VENTA FUE GUARDADA, PERO LA IMPRESIÓN FALLÓ:", printError);
      res.status(207).json({ // 207 Multi-Status: parte tuvo éxito, parte falló
        ok: true,
        mensaje: "¡Venta registrada con éxito, pero hubo un error al imprimir los tickets! Revisa la impresora.",
      });
    }

  } catch (dbError) {
    // Este catch ahora SÓLO se activará si hay un error en la base de datos.
    await t.rollback();
    console.error("Error de base de datos, rollback ejecutado:", dbError);
    res.status(500).json({ ok: false, mensaje: dbError.message || "Error al registrar la compra en la base de datos." });
  }
};

export const listarVentas = async (req, res) => {
  const ventas = await Venta.findAll();
  res.json(ventas);
};

// 👇 --- MODIFICA ESTA FUNCIÓN --- 👇
export const listarVentasItems = async (req, res) => {
  try {
    // Añadimos un 'where' para filtrar solo los items que no tienen un cierre_id asignado.
    const items = await VentaItem.findAll({
      where: {
        cierre_id: null
      },
      order: [['nombre', 'ASC']] // Opcional: ordenar por nombre de producto
    });
    res.json(items);
  } catch (error) {
    console.error("Error al listar items de venta:", error);
    res.status(500).json({ ok: false, mensaje: "Error al obtener las ventas del día" });
  }
};