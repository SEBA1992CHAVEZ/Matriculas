import React, { useState } from 'react';
import MatriculaForm from '../components/MatriculaForm';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Inicio");
  const menuItems = ["Inicio", "Matrículas", "Alumnos", "Apoderados", "Configuración"];

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-black tracking-tighter text-blue-400">EduCate</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full text-left block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 hover:text-white ${
                activeTab === item ? 'bg-slate-800 text-blue-400 font-bold' : ''
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800 text-xs text-slate-400 text-center">
          v1.0.0 Stable
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 border-b border-slate-200">
          <h1 className="text-lg font-semibold text-slate-700">Panel de Administración</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Administrador</span>
            <button onClick={() => { localStorage.clear(); window.location.href='/'; }} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-md font-medium">
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 space-y-6 overflow-y-auto">
          {activeTab === "Inicio" && (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">¡Bienvenido al Sistema!</h2>
              <p className="text-slate-600">Seleccione una opción del menú lateral para comenzar con la gestión de matrículas.</p>
            </div>
          )}

          {activeTab === "Matrículas" && (
            <MatriculaForm />
          )}

          {activeTab !== "Inicio" && activeTab !== "Matrículas" && (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center py-12">
              <p className="text-slate-500 italic">Módulo de {activeTab} en desarrollo...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;