import { Printer } from "@node-escpos/core";
import USB from "@node-escpos/usb-adapter";

/**
 * Imprime varios tickets de texto en la impresora USB.
 * @param {string[]} textos Array con el contenido de cada ticket
 */
export async function imprimirTickets(textos = []) {
  return new Promise((resolve, reject) => {
    const device = new USB(); // si hace falta vendorId/productId: new USB(vendorId, productId)

    device.open((err) => {
      if (err) {
        console.error("Error al abrir la impresora:", err);
        return reject(err);
      }

      const printer = new Printer(device, { encoding: "GB18030" });

      textos.forEach((texto) => {
        printer.text(texto).cut(); // cada ticket se corta
      });

      printer.close(() => resolve());
    });
  });
}
