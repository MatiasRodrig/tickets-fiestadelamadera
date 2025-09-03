import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Producto = sequelize.define("Producto", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: "productos"
});

export default Producto;
