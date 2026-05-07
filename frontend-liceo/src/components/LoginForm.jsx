import React, { useState } from 'react';
import axios from 'axios'; // Importamos Axios
import { useNavigate, Link } from 'react-router-dom'; // Para redirigir y navegar

const LoginForm = () => {
  // Hook para la navegación programática
  const navigate = useNavigate();

  // Estados para capturar los datos del formulario
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Estados para el manejo de la UI (errores, carga)
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Manejador de cambios en los inputs del formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value // Actualiza el estado según el nombre del input
    });
  };

  // Manejador del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario (recargar la página)
    setError(''); // Limpia cualquier error previo
    setSuccess(''); // Limpia cualquier mensaje de éxito previo
    setLoading(true); // Activa el estado de carga

    try {
      // Realiza la petición POST al backend usando Axios
      const response = await axios.post('http://localhost:3000/api/usuarios/login', formData);

      // Si el login es exitoso
      if (response.data.success) {
        // Guarda el token JWT en el almacenamiento local del navegador
        localStorage.setItem('token', response.data.token);
        setSuccess('¡Sesión iniciada con éxito! Redirigiendo...');
        
        // Redirige al usuario a la página de dashboard o principal
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        // Si el backend devuelve un error pero success es false
        setError(response.data.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      console.error("Login Error Details:", err); // Ayuda a depurar el error de Chrome
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Mensaje de error del backend
      } else {
        setError('No se pudo conectar con el servidor. Intenta de nuevo más tarde.'); // Error genérico de conexión
      }
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-xl shadow-xl border border-slate-200 w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Educatte</h2>
          <p className="text-slate-500 mt-2 text-sm font-medium italic tracking-wide">Plataforma de Gestión Educativa</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6" role="alert">
            <strong className="font-bold text-sm">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6" role="alert">
            <strong className="font-bold text-sm">Éxito: </strong>
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <div className="mb-5">
          <label htmlFor="username" className="block text-slate-700 text-sm font-semibold mb-2">Usuario</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition duration-200"
            placeholder="nombre.apellido"
          />
        </div>

        <div className="mb-8">
          <label htmlFor="password" className="block text-slate-700 text-sm font-semibold mb-2">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition duration-200"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform active:scale-95 transition duration-200 flex justify-center items-center"
        >
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>

        <div className="mt-6 text-center">
          <Link to="/forgot-password" size="sm" className="text-slate-500 hover:text-slate-800 text-sm transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <p className="mt-8 text-center text-slate-400 text-xs font-medium italic">
           © 2026 Educatte Derechos reservados.
        </p>
      </form>
    </div>
  );
};

export default LoginForm;