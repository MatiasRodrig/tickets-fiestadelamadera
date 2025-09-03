import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Usuario = sequelize.define("Usuario", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('administrador', 'cajero'),
    allowNull: false,
    defaultValue: 'cajero'
  }
}, {
  tableName: "usuarios"
});

export default Usuario;