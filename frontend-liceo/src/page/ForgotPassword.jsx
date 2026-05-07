import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [devToken, setDevToken] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('http://localhost:3000/api/usuarios/forgot-password', { username });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Usuario validado correctamente.' });
        setDevToken(response.data.token); // Guardamos el token recibido
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al procesar la solicitud' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-xl shadow-xl border border-slate-200 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Recuperar Acceso</h2>
        <p className="text-slate-500 mb-8 text-sm">
          Ingresa tu nombre de usuario para restablecer tu contraseña.
        </p>
        
        {message.text && (
          <div className={`mb-6 p-4 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-6 text-left">
          <label className="block text-slate-700 text-sm font-semibold mb-2">Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition"
            placeholder="nombre.apellido"
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition duration-200 mb-6"
        >
          {loading ? 'Validando...' : 'Validar Usuario'}
        </button>

        {devToken && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <p className="text-xs text-blue-600 font-bold uppercase mb-2">Acceso de Desarrollo:</p>
            <Link to={`/reset-password/${devToken}`} className="text-blue-700 font-bold underline hover:text-blue-900">
              Haz clic aquí para cambiar tu contraseña
            </Link>
          </div>
        )}

        <Link to="/login" className="text-blue-600 hover:underline text-sm font-medium">
          Volver al inicio de sesión
        </Link>
      </form>
    </div>
  );
};

export default ForgotPassword;