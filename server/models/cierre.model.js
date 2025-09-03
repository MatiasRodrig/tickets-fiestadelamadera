import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Cierre = sequelize.define("Cierre", {
    fecha_cierre: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    total_vendido: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    // Guardamos un resumen en formato JSON para futuras consultas
    detalle: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: "cierres"
});

export default Cierre;