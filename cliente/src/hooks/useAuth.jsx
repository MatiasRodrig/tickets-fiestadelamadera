import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser && token) {
                setUser(storedUser);
            }
        } catch (e) {
            // Si hay un error de parseo, limpiamos el storage.
            localStorage.clear();
            setUser(null);
        }
    }, [token]);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        // La redirección se manejará en el componente
    };

    // Función helper para obtener los headers de autorización
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    return { user, token, logout, getAuthHeaders };
};