import { useState, useEffect } from "react";
import styles from "../styles/cards.module.css";
import { Link } from 'react-router-dom'

function ProductosListados() {
    const [productos, setProductos] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [perPage] = useState(5); // productos por página
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ nombre: "", precio: "", imagen: null });

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        const res = await fetch("/api/productos");
        const data = await res.json();
        setProductos(data);
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (files) setForm({ ...form, [name]: files[0] });
        else setForm({ ...form, [name]: value });
    };

    const handleCreateProducto = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("nombre", form.nombre);
        formData.append("precio", form.precio);
        if (form.imagen) formData.append("imagen", form.imagen);

        await fetch("/api/productos", {
            method: "POST",
            body: formData,
        });

        setShowModal(false);
        setForm({ nombre: "", precio: "", imagen: null });
        fetchProductos();
    };

    const filtered = productos.filter((p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / perPage);
    const displayed = filtered.slice((page - 1) * perPage, page * perPage);

    return (
        <div className={styles.container}>
            <h2>Productos</h2>

            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={() => setShowModal(true)}>Crear producto</button>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                    </tr>
                </thead>
                <tbody>
                    {displayed.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.nombre}</td>
                            <td>${p.precio}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={styles.pagination}>
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                    ◀
                </button>
                <span>
                    {page} / {totalPages}
                </span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    ▶
                </button>
            </div>

            {/* Modal para crear producto */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Crear Producto</h3>
                        <form onSubmit={handleCreateProducto}>
                            <label>
                                Nombre:
                                <input
                                    type="text"
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>
                            <label>
                                Precio:
                                <input
                                    type="number"
                                    name="precio"
                                    value={form.precio}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                />
                            </label>
                            <label>
                                Imagen:
                                <input
                                    type="file"
                                    name="imagen"
                                    onChange={handleInputChange}
                                    accept="image/*"
                                    required
                                />
                            </label>
                            <div className={styles.modalButtons}>
                                <button type="submit">Guardar</button>
                                <button type="button" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <Link to="/">
                <button>Volver</button>
            </Link>
        </div>
    );
}

export default ProductosListados;
