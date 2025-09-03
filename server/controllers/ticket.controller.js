import Producto from "../models/producto.model.js";
import Venta from "../models/ventas.model.js";
import VentaItem from "../models/venta_item.model.js"; 
import { imprimirTickets } from "../imprimirTicket.js";

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

export const listarVentas = async (req, res) => {
  const ventas = await Venta.findAll();
  res.json(ventas);
};
