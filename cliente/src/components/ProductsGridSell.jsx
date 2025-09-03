import { useState, useEffect } from 'react'
import styles from '../styles/cards.module.css'

function ProductsGrid() {
    const [products, setProducts] = useState([])
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(8) // 👈 cantidad de productos por página

    const [selectedProduct, setSelectedProduct] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [cart, setCart] = useState([])

    useEffect(() => {
        const fetchProducts = async () => {
            const response = await fetch('/api/productos')
            const data = await response.json()
            setProducts(data)
        }
        fetchProducts()
    }, [])

    // 🔍 Filtrar productos
    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
    )

    // 📄 Paginación
    const indexOfLast = currentPage * itemsPerPage
    const indexOfFirst = indexOfLast - itemsPerPage
    const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast)
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

    const handleCardClick = (product) => {
        setSelectedProduct(product)
        setQuantity(1)
        setShowModal(true)
    }

    const handleAddToCart = () => {
        setCart(prev => {
            const existing = prev.find(item => item.id === selectedProduct.id)
            if (existing) {
                return prev.map(item =>
                    item.id === selectedProduct.id
                        ? { ...item, cantidad: item.cantidad + quantity }
                        : item
                )
            } else {
                return [...prev, { ...selectedProduct, cantidad: quantity }]
            }
        })
        setShowModal(false)
    }

    const handleCancel = () => setShowModal(false)

    const handleCheckout = async () => {
        try {
            for (let item of cart) {
                await fetch('/api/imprimir', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: item.id, cantidad: item.cantidad })
                });
            }

            alert('Compra registrada y tickets enviados!')
            setCart([])
            setSelectedProduct(null)
            setQuantity(1)
            setShowModal(false)
            window.location.reload()
        } catch (error) {
            console.error(error)
        }
    }

    const Card = ({ product }) => (
        <div className={styles.card} onClick={() => handleCardClick(product)}>
            <img className={styles.cardImg} src={product.imagen} alt={product.nombre} />
            <h2>{product.nombre}</h2>
            <p>Precio: ${product.precio}</p>
        </div>
    )

    return (
        <div className={styles.container}>
            <h2>Productos</h2>

            {/* 🔍 Buscador */}
            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setCurrentPage(1) // resetear a la página 1 al buscar
                    }}
                />
            </div>

            {/* 🛒 Grid de productos */}
            <div className={styles.cardContainer}>
                {currentProducts.length > 0 ? (
                    currentProducts.map(product => (
                        <Card key={product.id} product={product} />
                    ))
                ) : (
                    <p>No se encontraron productos</p>
                )}
            </div>

            {/* 📄 Paginación */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && selectedProduct && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>{selectedProduct.nombre}</h2>
                        <p>Precio: ${selectedProduct.precio}</p>
                        <label>
                            Cantidad:
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </label>
                        <div className={styles.modalButtons}>
                            <button onClick={handleAddToCart}>Añadir compra</button>
                            <button onClick={handleCancel}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Carrito */}
            {cart.length > 0 && (
                <div className={styles.cart}>
                    <h3>Carrito</h3>
                    {cart.map(item => (
                        <div key={item.id} className={styles.cartItem}>
                            <span>{item.nombre} x {item.cantidad}</span>
                            <div className={styles.cartButtons}>
                                <input
                                    type="number"
                                    min="1"
                                    value={item.cantidad}
                                    onChange={(e) => {
                                        const newQty = Number(e.target.value)
                                        setCart(prev =>
                                            prev.map(p =>
                                                p.id === item.id ? { ...p, cantidad: newQty } : p
                                            )
                                        )
                                    }}
                                />
                                <button onClick={() =>
                                    setCart(prev => prev.filter(p => p.id !== item.id))
                                }>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className={styles.cartFooter}>
                        <button onClick={handleCheckout}>Finalizar compra</button>
                        <button onClick={() => setCart([])}>Cancelar carrito</button>
                    </div>
                </div>
            )}

        </div>
    )
}

export default ProductsGrid
