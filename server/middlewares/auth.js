import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;


export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(403).send("Se requiere un token para la autenticación");
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Guardamos los datos del usuario (id, role) en el objeto 'req'
    } catch (err) {
        return res.status(401).send("Token inválido");
    }
    return next();
};

// Middleware para verificar si el usuario es administrador
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'administrador') {
        next(); // El usuario es admin, puede continuar
    } else {
        res.status(403).send("Acceso denegado. Se requiere rol de administrador.");
    }
};