const Matricula = require('../models/Matricula');
const Alumno = require('../models/Alumno');

// Función auxiliar para validar RUT Chileno (opcional pero recomendada)
const validateRut = (rut) => {
    if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rut)) return false;
    let [num, dv] = rut.split('-');
    // Aquí iría la lógica del algoritmo módulo 11
    return true; 
};

const createMatricula = async (req, res) => {
    try {
        // 1. Verificación de Rol (Seguridad de Acceso)
        // Asumiendo que req.user viene del middleware verifyToken
        if (req.user.id_role > 2) { // 1: Admin, 2: Directivo
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permisos suficientes para realizar matrículas.' 
            });
        }

        let data = req.body;

        // 2. Sanitización Básica
        Object.keys(data).forEach(key => {
            if (typeof data[key] === 'string') {
                data[key] = data[key].trim().toUpperCase();
            }
        });

        // 3. Conversión de tipos para PostgreSQL
        const numericFields = [
            'id_nivel', 'id_comuna', 'id_parentesco', 'id_curso',
            'estatura_cm', 'peso_kg', 'calzado'
        ];
        numericFields.forEach(field => {
            const val = data[field];
            if (val !== undefined && val !== null && val !== '') {
                const parsed = parseInt(val);
                data[field] = isNaN(parsed) ? null : parsed;
            } else {
                data[field] = null;
            }
        });

        // Validación de datos del Alumno (Tabla alumnos)
        if (!data.rut_estudiante || !data.nombres || !data.apellido_paterno) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan datos obligatorios del alumno (RUT, Nombres, Apellido Paterno).'
            });
        }

        // 3. Validación de Formatos
        if (!validateRut(data.rut_estudiante)) {
            return res.status(400).json({ success: false, message: 'El formato del RUT del estudiante es inválido.' });
        }

        if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
            return res.status(400).json({ success: false, message: 'El correo electrónico del estudiante no es válido.' });
        }

        // Validación de datos del Apoderado
        if (!data.rut_apoderado || !data.nombres_apoderado || !data.id_parentesco) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios del apoderado (RUT, Nombres, Parentesco).' 
            });
        }

        // Validación básica de dirección
        if (!data.id_comuna || isNaN(data.id_comuna)) {
            return res.status(400).json({
                success: false,
                message: 'La comuna es obligatoria y debe ser un ID válido.'
            });
        }

        // Validación de salud
        const sistemasValidos = ['FONASA', 'ISAPRE', 'PARTICULAR', 'DIPRECA', 'CAPREDENA'];
        if (!data.sistema_salud || !sistemasValidos.includes(data.sistema_salud)) {
            return res.status(400).json({
                success: false,
                message: 'El sistema de salud es obligatorio y debe ser válido (FONASA, ISAPRE, etc.).'
            });
        }

        // Validación de autorizaciones
        if (!data.acepta_reglamento_interno) {
            return res.status(400).json({
                success: false,
                message: 'Es obligatorio aceptar el reglamento interno y de convivencia escolar.'
            });
        }

        const id = await Matricula.create(data);
        res.status(201).json({ 
            success: true, 
            id, 
            message: 'Matrícula y asignación de electivos procesada correctamente.' 
        });
    } catch (error) {
        console.error("Error en MatriculaController:", error);

        // Manejo de errores de Postgres
        if (error.code) {
            const isKnownError = ['23505', 'P0001', '23503', '23502', '42703'].includes(error.code);
            return res.status(isKnownError ? 400 : 500).json({
                success: false,
                message: isKnownError ? `Error de validación: ${error.message}` : 'Error de base de datos',
                error: error.message,
                code: error.code
            });
        }

        // Errores manuales (como el throw Error del modelo)
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};

const getReporteMatriculas = async (req, res) => {
    try {
        const rows = await Matricula.getReporte();
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener reporte', error: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await Matricula.getStats();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener estadísticas', error: error.message });
    }
};

const checkStudent = async (req, res) => {
    try {
        const { rut } = req.params;
        const data = await Alumno.getFullDataByRut(rut);
        res.status(200).json({ success: true, exists: !!data, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al buscar alumno', error: error.message });
    }
};

module.exports = { createMatricula, getReporteMatriculas, getStats, checkStudent };