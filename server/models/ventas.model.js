import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Venta = sequelize.define("Venta", {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: "ventas"
});

export default Venta;
