import { Printer } from "@node-escpos/core";
import USB from "@node-escpos/usb-adapter";

export async function imprimirTickets(textos = []) {
  return new Promise((resolve, reject) => {
    let device;
    try {
      device = new USB();
    } catch (e) {
      console.error("[Printer] ERROR al instanciar el dispositivo USB:", e);
      return reject(e);
    }

    // --- 👇 DEFENSA Nivel 2: Manejador de errores del dispositivo ---
    // Atrapamos errores que la librería pueda emitir en su ciclo de vida.
    device.on('error', (err) => {
      console.error("[Printer] ERROR emitido por el dispositivo USB:", err);
      // Intentamos cerrar y luego rechazamos la promesa.
      try {
        if (device) device.close(() => reject(err));
        else reject(err);
      } catch (closeErr) {
        reject(err); // Rechazamos con el error original.
      }
    });
    // --- FIN DEFENSA Nivel 2 ---

    console.log("[Printer] Intentando abrir dispositivo USB...");
    device.open((openErr) => {
      if (openErr) {
        console.error("[Printer] ERROR al abrir el dispositivo USB:", openErr);
        return reject(openErr);
      }
      console.log("[Printer] Dispositivo USB abierto. Creando instancia de Printer.");

      const printer = new Printer(device, { encoding: "GB18030" });

      try {
        console.log(`[Printer] Imprimiendo ${textos.length} tickets...`);
        textos.forEach((texto) => {
          printer.text(texto).cut();
        });
        console.log("[Printer] Impresión enviada. Cerrando conexión...");

        printer.close(() => {
          console.log("[Printer] Conexión cerrada correctamente.");
          resolve(); // Éxito
        });

      } catch (printError) {
        console.error("[Printer] ERROR durante el proceso de impresión:", printError);
        printer.close(() => {
          console.log("[Printer] Conexión cerrada después de un error de impresión.");
          reject(printError);
        });
      }
    });
  });
}