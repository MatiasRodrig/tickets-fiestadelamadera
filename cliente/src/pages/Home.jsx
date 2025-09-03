import { useState } from 'react' // 👈 Importar useState
import { Link } from 'react-router-dom'
import ProductsGridSell from '../components/ProductsGridSell'
import styles from '../styles/cards.module.css'

function Home() {
    // --- NUEVOS ESTADOS PARA EL MODAL DE CIERRE ---
    const [showCierreModal, setShowCierreModal] = useState(false)
    const [modalContent, setModalContent] = useState({
        state: 'confirm', // puede ser 'confirm', 'loading', 'success', 'error'
        message: ''
    })
    // --- FIN DE NUEVOS ESTADOS ---


    const handleOpenCierreModal = () => {
        // Reseteamos el estado del modal y lo mostramos
        setModalContent({
            state: 'confirm',
            message: '¿Estás seguro de que deseas cerrar la caja? Esta acción generará un reporte con todas las ventas desde el último cierre y las marcará como finalizadas.'
        })
        setShowCierreModal(true)
    }

    const handleConfirmCierre = async () => {
        // 1. Cambiamos al estado de carga
        setModalContent({ state: 'loading', message: 'Procesando cierre...' })

        try {
            const response = await fetch('/api/cierre-caja', {
                method: 'POST',
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                // Si la respuesta no es 200 OK o si el backend dice que no está ok
                throw new Error(data.mensaje || 'No se pudo realizar el cierre.');
            }

            // 2. Si todo fue exitoso, cambiamos al estado de éxito
            setModalContent({
                state: 'success',
                message: '¡Cierre de caja exitoso! El ticket de resumen se ha enviado a la impresora.'
            });

        } catch (error) {
            console.error('Error al realizar el cierre de caja:', error);
            // 3. Si hubo un error, cambiamos al estado de error
            setModalContent({
                state: 'error',
                message: error.message || 'Hubo un problema de conexión al intentar cerrar la caja.'
            });
        }
    }

    const handleCloseModal = () => {
        const isSuccess = modalContent.state === 'success';
        setShowCierreModal(false);
        // Si el cierre fue exitoso, recargamos la página al cerrar el modal
        if (isSuccess) {
            window.location.reload();
        }
    }


    // --- JSX DEL MODAL PERSONALIZADO ---
    const CierreModal = () => (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h3>Cierre de Caja</h3>
                <p>{modalContent.message}</p>

                {modalContent.state === 'loading' && (
                    <div className={styles.loader}>Cargando...</div> // Puedes poner un spinner aquí si quieres
                )}

                {modalContent.state === 'confirm' && (
                    <div className={styles.modalButtons}>
                        <button onClick={handleConfirmCierre}>Continuar con el Cierre</button>
                        <button onClick={handleCloseModal}>Cancelar</button>
                    </div>
                )}

                {(modalContent.state === 'success' || modalContent.state === 'error') && (
                    <div className={styles.modalButtons}>
                        <button onClick={handleCloseModal}>Cerrar</button>
                    </div>
                )}
            </div>
        </div>
    );


    return (
        <div className={styles.homeContainer}>

            {/* Renderizamos el modal si showCierreModal es true */}
            {showCierreModal && <CierreModal />}

            <h1 className={styles.homeTitle}>Panel de Ventas</h1>

            <div className={styles.pagination}>
                <Link to="/productos" className={styles.homeButton}>
                    Ver Productos
                </Link>

                <Link to="/registros" className={styles.homeButton}>
                    Ver Registros
                </Link>

                {/* 👇 El botón ahora solo abre el modal 👇 */}
                <button onClick={handleOpenCierreModal} className={styles.homeButton} style={{padding: '13px 20px', backgroundColor: '#e74c3c', color: 'white'}}>
                    Cerrar Caja
                </button>

            </div>

            <ProductsGridSell />
        </div>
    )
}

export default Home;