import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './page/Dashboard'; // Corregido a 'page' en singular
import ForgotPassword from './page/ForgotPassword';
import ResetPassword from './page/ResetPassword';
import MainLayout from './components/MainLayout';
import MatriculaForm from './components/MatriculaForm';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Rutas protegidas que mantienen el Sidebar mediante MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/matricula" element={<MatriculaForm />} />
          </Route>

          {/* Agrega más rutas aquí según sea necesario */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;