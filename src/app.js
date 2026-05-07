require('dotenv').config();
const express = require('express');
const usuarioRoutes = require('./routes/usuarioRoutes');
const cors = require('cors'); // Importar cors
const alumnoRoutes = require('./routes/alumnoRoutes');
const apoderadoRoutes = require('./routes/apoderadoRoutes');
const matriculaRoutes = require('./routes/matriculaRoutes');
const comunaRoutes = require('./routes/comunaRoutes');
const nivelRoutes = require('./routes/nivelRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const electivoRoutes = require('./routes/electivoRoutes');

const app = express();
app.use(express.json());
app.use(cors()); // Habilitar CORS para permitir peticiones desde el frontend (Vite)

// Logger de peticiones simple
app.use((req, res, next) => {
    const now = new Date().toISOString();
    console.log(`[${now}] ${req.method} ${req.url}`);
    next();
});

// Definición de Rutas (Endpoints)
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/apoderados', apoderadoRoutes);
app.use('/api/comunas', comunaRoutes);
app.use('/api/niveles', nivelRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/matriculas', matriculaRoutes);
app.use('/api/electivos', electivoRoutes);

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.stack}`);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor MVC corriendo en http://localhost:${PORT}`);
});
