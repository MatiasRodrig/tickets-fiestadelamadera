import { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'

function Registros() {
    const [ventas, setVentas] = useState([])

    useEffect(() => {
        const fetchVentas = async () => {
            const response = await fetch('/api/ventas')
            const data = await response.json()
            setVentas(data)
        }
        fetchVentas()
    }, [])

    return (
        <div>
            <h2>Registros de Ventas</h2>
            <Link to="/"><button>Volver</button></Link>
            <ul>
                {ventas.map(venta => (
                    <li key={venta.id}>
                        {venta.nombre} {venta.total}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Registros