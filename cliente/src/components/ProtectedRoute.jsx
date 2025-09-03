import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
    const { token } = useAuth();

    // Si no hay token, redirigir al login.
    if (!token) {
        return <Navigate to="/login" />;
    }

    // Si hay token, renderizar el contenido de la ruta anidada.
    return <Outlet />;
};

export default ProtectedRoute;