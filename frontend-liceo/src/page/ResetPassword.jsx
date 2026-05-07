import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams(); // Obtiene el token de la URL
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Opcional: Puedes hacer una verificación inicial del token aquí si lo deseas,
    // pero la verificación principal se hará en el backend al enviar el formulario.
    if (!token) {
      setError('Token de restablecimiento no encontrado.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Token de restablecimiento inválido o faltante.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3000/api/usuarios/reset-password/${token}`, {
        password: password,
      });

      if (response.data.success) {
        setSuccessMessage('¡Éxito! Tu contraseña ha sido cambiada. Redirigiendo...');
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        setError(response.data.message || 'Ocurrió un error al restablecer la contraseña.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-xl shadow-xl border border-slate-200 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Restablecer Contraseña</h2>
        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6" role="alert"><strong className="font-bold text-sm">Error: </strong><span className="block sm:inline">{error}</span></div>}
        {successMessage && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6" role="alert"><strong className="font-bold text-sm">Éxito: </strong><span className="block sm:inline">{successMessage}</span></div>}

        {!token && !error && <p className="text-red-500 mb-4">Cargando...</p>}
        {token && (
          <>
            <div className="mb-5 text-left">
              <label className="block text-slate-700 text-sm font-semibold mb-2" htmlFor="password">Nueva Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="mb-6 text-left">
              <label className="block text-slate-700 text-sm font-semibold mb-2" htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition duration-200 mb-6">
              {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </button>
          </>
        )}

        <Link to="/login" className="text-blue-600 hover:underline text-sm font-medium">
          Volver al inicio de sesión
        </Link>
      </form>
    </div>
  );
};

export default ResetPassword;