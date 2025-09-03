
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ProductosListados from './pages/Products';
import Registros from './pages/Registros';
import HistorialCierres from './pages/HistorialCierres'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth'; 

function App() {
  const { token } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Si ya hay token, ir a home, si no, al login */}
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<ProductosListados />} />
          <Route path="/historial" element={<HistorialCierres />} />
          <Route path="/registros" element={<Registros />} />
        </Route>

        {/* Redirección para cualquier otra ruta no encontrada */}
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;