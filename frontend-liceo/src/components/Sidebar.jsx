import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Inicio', path: '/dashboard', icon: '🏠' },
    { name: 'Matrícula', path: '/matricula', icon: '📝' },
    { name: 'Reportes', path: '/reportes', icon: '📊' },
    { name: 'Configuración', path: '/configuracion', icon: '⚙️' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col sticky top-0 shadow-xl">
      <div className="p-8 text-2xl font-black tracking-tight border-b border-slate-800 text-center">
        EduCate
      </div>
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-8 py-4 transition-all duration-200 ${
              location.pathname === item.path 
                ? 'bg-slate-800 border-r-4 border-slate-400 text-white' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            <span className="font-semibold">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full bg-slate-800 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;