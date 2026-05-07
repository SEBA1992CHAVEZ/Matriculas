import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './page/Dashboard'; // Corregido a 'page' en singular
import ForgotPassword from './page/ForgotPassword';
import ResetPassword from './page/ResetPassword';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* Agrega más rutas aquí según sea necesario */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;