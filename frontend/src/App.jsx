import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'; // Importamos el nuevo componente
import ClientesPage from './pages/ClientesPage'; 
import TecnicosPage from './pages/TecnicosPage'; 
import AsesoresPage from './pages/AsesoresPage'; 
import OrdenesPage from './pages/OrdenesPage';
import UsuariosPage from './pages/UsuariosPage'; 
import LoginPage from './pages/LoginPage';     
import DashboardPage from './pages/DashboardPage';
import HistorialPage from './pages/HistorialPage';
import ConsultaCodigosPage from './pages/ConsultaCodigosPage'; // Ajusta la ruta según tu carpeta

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const userRol = localStorage.getItem('rol');

  return (
    <Router>
      {/* Si está autenticado, mostramos el Navbar independiente */}
      {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}

      {/* Contenedor principal ajustado para resolución 1366x768 */}
      <div style={{ padding: '0px', fontFamily: 'Arial, sans-serif' }}>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />}/>

          {/* DASHBOARD: Solo admin */}
          <Route path="/" element={
            isAuthenticated ? (
              userRol === 'admin' ? <DashboardPage /> : <Navigate to="/ordenes" />
            ) : <Navigate to="/login" />
          } />

          {/* RUTAS PROTEGIDAS */}
          <Route path="/asesores" element={isAuthenticated && userRol === 'admin' ? <AsesoresPage /> : <Navigate to="/login" />} />
          <Route path="/tecnicos" element={isAuthenticated && userRol === 'admin' ? <TecnicosPage /> : <Navigate to="/login" />} />
          <Route path="/clientes" element={isAuthenticated ? <ClientesPage /> : <Navigate to="/login" />} />
          <Route path="/ordenes" element={isAuthenticated ? <OrdenesPage /> : <Navigate to="/login" />} />
          <Route path="/historial" element={isAuthenticated ? <HistorialPage /> : <Navigate to="/login" />} />
          <Route path="/consultar-codigos" element={<ConsultaCodigosPage />} /> 
          <Route path="/usuarios" element={
            isAuthenticated && userRol === 'admin' ? <UsuariosPage /> : <Navigate to="/" />
          } />

          <Route path="*" element={<h2>404 - No encontrado</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;