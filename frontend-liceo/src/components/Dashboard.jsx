import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Elimina el token
    navigate('/login'); // Redirige al login
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Bienvenido al Dashboard</h1>
      <p className="text-gray-700 mb-6">Aquí irá el contenido principal de tu aplicación.</p>
      <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Dashboard;