import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router"
import Home from './pages/Home';
import ProductosListados from './pages/Products';
import Registros from './pages/Registros';

  
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/productos" element={<ProductosListados />} />
      <Route path="/registros" element={<Registros />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}


export default App
