import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalMatriculados: 0, distribucionNiveles: [] });
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/matriculas/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Error al cargar métricas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center font-medium text-slate-500">Cargando métricas...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Panel de Inicio</h1>
      
      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Matriculados</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{stats.totalMatriculados}</p>
          <div className="mt-4 text-xs text-green-600 font-bold bg-green-50 inline-block px-2 py-1 rounded">
            Periodo Lectivo 2026
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Niveles Activos</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{stats.distribucionNiveles.length}</p>
        </div>
      </div>

      {/* Gráfico de Distribución */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Distribución de Alumnos por Nivel</h3>
          <p className="text-slate-500 text-sm">Cantidad de estudiantes registrados por nivel educativo</p>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.distribucionNiveles}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                {stats.distribucionNiveles.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;