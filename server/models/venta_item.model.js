import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const VentaItem = sequelize.define("VentaItem", {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    precio_unitario: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    // Relacionamos este item con un cierre de caja una vez que se realiza.
    cierre_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'cierres',
            key: 'id'
        }
    }
}, {
    tableName: "venta_items"
});

export default VentaItem;