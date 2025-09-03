import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/cards.module.css'; // Reutilizamos los estilos existentes

function Registros() {
    const [ventasDia, setVentasDia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVentasDelDia = async () => {
            try {
                const response = await fetch('/api/ventas/items');
                if (!response.ok) throw new Error("Error al cargar los datos");
                const data = await response.json();
                setVentasDia(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchVentasDelDia();
    }, []);

    // useMemo para calcular los datos agrupados y los totales solo cuando 'ventasDia' cambia.
    const { aggregatedSales, grandTotals } = useMemo(() => {
        if (!ventasDia || ventasDia.length === 0) {
            return { aggregatedSales: [], grandTotals: { cantidad: 0, total: 0 } };
        }

        const summary = {};
        // 1. Agrupar ventas por nombre de producto
        for (const venta of ventasDia) {
            if (summary[venta.nombre]) {
                summary[venta.nombre].cantidad += venta.cantidad;
                summary[venta.nombre].total += venta.total;
            } else {
                summary[venta.nombre] = {
                    cantidad: venta.cantidad,
                    total: venta.total,
                };
            }
        }

        // 2. Convertir el objeto de resumen en un array para poder mapearlo
        const aggregatedArray = Object.keys(summary).map(nombre => ({
            nombre,
            cantidad: summary[nombre].cantidad,
            total: summary[nombre].total,
        }));

        // 3. Calcular los totales generales
        const totals = aggregatedArray.reduce((acc, curr) => {
            acc.cantidad += curr.cantidad;
            acc.total += curr.total;
            return acc;
        }, { cantidad: 0, total: 0 });

        return { aggregatedSales: aggregatedArray, grandTotals: totals };
    }, [ventasDia]);


    if (loading) {
        return <div className={styles.container}><h2>Cargando ventas del día...</h2></div>
    }

    return (
        <div className={styles.container}>
            <h2>Ventas del Día (Antes del Cierre)</h2>
            <Link to="/"><button>Volver al Panel</button></Link>

            {aggregatedSales.length > 0 ? (
                <table className={styles.table} style={{ marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad Vendida</th>
                            <th>Total Recaudado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregatedSales.map(item => (
                            <tr key={item.nombre}>
                                <td>{item.nombre}</td>
                                <td>{item.cantidad}</td>
                                <td>${item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>TOTALES</strong></td>
                            <td><strong>{grandTotals.cantidad}</strong></td>
                            <td><strong>${grandTotals.total.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            ) : (
                <p style={{ marginTop: '20px' }}>Aún no se han registrado ventas en esta sesión.</p>
            )}
        </div>
    );
}

export default Registros;