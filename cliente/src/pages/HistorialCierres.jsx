import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/cards.module.css'; // Usamos los mismos estilos
import historialStyles from '../styles/historial.module.css'; // Estilos específicos

function HistorialCierres() {
    const [cierres, setCierres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null); // ID del cierre expandido
    const [reprintStatus, setReprintStatus] = useState({}); // Estado de la reimpresión

    useEffect(() => {
        const fetchCierres = async () => {
            try {
                const response = await fetch('/api/cierres');
                const data = await response.json();
                setCierres(data);
            } catch (error) {
                console.error("Error al cargar el historial:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCierres();
    }, []);

    const toggleExpand = (id) => {
        setExpandedId(prevId => (prevId === id ? null : id));
    };

    const handleReprint = async (cierreId) => {
        if (reprintStatus[cierreId] === 'loading') return;

        setReprintStatus(prev => ({ ...prev, [cierreId]: 'loading' }));
        try {
            const response = await fetch(`/api/cierres/${cierreId}/reimprimir`, {
                method: 'POST',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.mensaje);

            setReprintStatus(prev => ({ ...prev, [cierreId]: 'success' }));
        } catch (error) {
            console.error("Error al reimprimir:", error);
            setReprintStatus(prev => ({ ...prev, [cierreId]: 'error' }));
        }
    };


    if (loading) {
        return <div className={styles.container}><h2>Cargando historial...</h2></div>;
    }

    return (
        <div className={styles.container}>
            <h2>Historial de Cierres de Caja</h2>

            <div className={historialStyles.historialContainer}>
                {cierres.length > 0 ? (
                    cierres.map(cierre => (
                        <div key={cierre.id} className={historialStyles.cierreCard}>
                            <div className={historialStyles.cierreHeader} onClick={() => toggleExpand(cierre.id)}>
                                <div>
                                    <span className={historialStyles.fecha}>
                                        {new Date(cierre.fecha_cierre).toLocaleDateString('es-AR', {
                                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                    <span className={historialStyles.total}>
                                        Total: ${cierre.total_vendido.toFixed(2)}
                                    </span>
                                </div>
                                <span className={historialStyles.toggleIcon}>
                                    {expandedId === cierre.id ? '▲' : '▼'}
                                </span>
                            </div>

                            {expandedId === cierre.id && (
                                <div className={historialStyles.cierreBody}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(cierre.detalle).map(([nombre, detalles]) => (
                                                <tr key={nombre}>
                                                    <td>{nombre}</td>
                                                    <td>{detalles.cantidad}</td>
                                                    <td>${detalles.total.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button
                                        onClick={() => handleReprint(cierre.id)}
                                        disabled={reprintStatus[cierre.id] === 'loading'}
                                        className={historialStyles.reprintButton}
                                    >
                                        {reprintStatus[cierre.id] === 'loading' ? 'Imprimiendo...' :
                                            reprintStatus[cierre.id] === 'success' ? 'Enviado!' :
                                                reprintStatus[cierre.id] === 'error' ? 'Error. Reintentar' : 'Reimprimir Ticket'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No se encontraron cierres de caja registrados.</p>
                )}
            </div>

            <Link to="/"><button style={{ marginTop: '20px' }}>Volver al Panel</button></Link>
        </div>
    );
}

export default HistorialCierres;