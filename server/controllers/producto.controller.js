import Producto from "../models/producto.model.js";

// Crear producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const imagen = req.file ? `/uploads/${req.file.filename}` : null;
    const producto = await Producto.create({ nombre, precio, imagen });
    res.json(producto);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// Listar productos
export const listarProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      attributes: ["id", "nombre", "precio", "imagen"],
    });

    // Agregar la URL completa al campo imagen
    const productosConURL = productos.map((p) => ({
      ...p.toJSON(),
      imagen: p.imagen ? `${req.protocol}://${req.get("host")}${p.imagen}` : null,
    }));

    res.json(productosConURL);
  } catch (error) {
    console.error("Error al listar productos:", error);
    res.status(500).json({ error: "Error al listar productos" });
  }
};


// Actualizar producto
export const actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio } = req.body;
  const producto = await Producto.findByPk(id);
  if (!producto) return res.status(404).json({ error: "No encontrado" });
  await producto.update({ nombre, precio });
  res.json(producto);
};

// Eliminar producto
export const eliminarProducto = async (req, res) => {
  const { id } = req.params;
  const producto = await Producto.findByPk(id);
  if (!producto) return res.status(404).json({ error: "No encontrado" });
  await producto.destroy();
  res.json({ ok: true });
};
