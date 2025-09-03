import Usuario from "../models/usuario.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET  

export const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el "salt rounds"

        const newUser = await Usuario.create({
            username,
            password: hashedPassword,
            role: role || 'cajero' // Por defecto, es cajero
        });

        res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role });
    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ message: "Error al registrar el usuario", error: error.message });
    }
};


export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Usuario.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Comparar la contraseña proporcionada con el hash almacenado
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Si las credenciales son correctas, crear un token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' } // El token expira en 8 horas
        );

        // Devolvemos el token y la información del usuario (sin la contraseña)
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
};