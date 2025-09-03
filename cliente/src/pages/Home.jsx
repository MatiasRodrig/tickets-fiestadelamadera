import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductsGridSell from '../components/ProductsGridSell';
import styles from '../styles/cards.module.css';

function Home() {
    const [showCierreModal, setShowCierreModal] = useState(false);
    const [modalContent, setModalContent] = useState({
        state: 'confirm', // puede ser 'confirm', 'loading', 'success', 'error'
        message: ''
    });

    const handleOpenCierreModal = () => {
        // Al abrir, siempre reseteamos al estado de confirmación.
        setModalContent({
            state: 'confirm',
            message: '¿Estás seguro de que deseas cerrar la caja? Esta acción generará un reporte con todas las ventas desde el último cierre y las marcará como finalizadas.'
        });
        setShowCierreModal(true);
    };

    const handleConfirmCierre = async () => {
        setModalContent({ state: 'loading', message: 'Procesando cierre...' });

        try {
            const response = await fetch('/api/cierre-caja', { method: 'POST' });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje || 'Falló la comunicación con el servidor.');
            }

            // Ya sea éxito total o parcial, mostramos el mensaje del backend.
            setModalContent({
                state: 'success',
                message: data.mensaje || '¡Operación completada con éxito!'
            });

        } catch (error) {
            console.error('Error al realizar el cierre de caja:', error);
            setModalContent({
                state: 'error',
                message: error.message || 'Hubo un problema de conexión.'
            });
        }
    };

    // Esta función ahora SÓLO cierra el modal. Nada más.
    const handleCloseModal = () => {
        setShowCierreModal(false);
    };


    const CierreModal = () => (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h3>Cierre de Caja</h3>
                <p>{modalContent.message}</p>

                {modalContent.state === 'loading' && (
                    <div className={styles.loader}>Cargando...</div>
                )}

                {modalContent.state === 'confirm' && (
                    <div className={styles.modalButtons}>
                        <button onClick={handleConfirmCierre}>Continuar con el Cierre</button>
                        <button onClick={handleCloseModal}>Cancelar</button>
                    </div>
                )}

                {/* Cuando la operación termina (con éxito o error), solo mostramos un botón para cerrar. */}
                {(modalContent.state === 'success' || modalContent.state === 'error' || modalContent.state === 'loading') && (
                    <div className={styles.modalButtons}>
                        <button onClick={handleCloseModal}>Aceptar y Cerrar</button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className={styles.homeContainer}>
            {showCierreModal && <CierreModal />}

            <h1 className={styles.homeTitle}>Panel de Ventas</h1>

            <div className={styles.pagination}>
                <Link to="/productos" className={styles.homeButton}>Ver Productos</Link>
                <Link to="/registros" className={styles.homeButton}>Ver Registros</Link>
                <Link to="/historial" className={styles.homeButton}>
                    Historial de Cierres
                </Link>
                <button
                    onClick={handleOpenCierreModal}
                    className={styles.homeButton}
                    style={{ padding: '13px 20px', backgroundColor: '#e74c3c', color: 'white' }}
                >
                    Cerrar Caja
                </button>
            </div>

            <ProductsGridSell />
        </div>
    );
}

export default Home;