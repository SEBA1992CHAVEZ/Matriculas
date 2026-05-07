const Matricula = require('../models/Matricula');

const createMatricula = async (req, res) => {
    try {
        const { alumno, apoderado, apoderado_suplente, direccion, salud } = req.body;

        // Validación de datos del Alumno (Tabla alumnos)
        if (!alumno || !alumno.rut_estudiante || !alumno.nombres || !alumno.apellido_paterno || !alumno.id_curso) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan datos obligatorios del alumno (RUT, Nombres, Apellido Paterno y Curso).' 
            });
        }

        // Validación de datos del Apoderado (Tabla apoderados y detalle_apoderados_alumno)
        if (!apoderado || !apoderado.rut_apoderado || !apoderado.nombres || !apoderado.id_parentesco) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios del apoderado (RUT, Nombres, Parentesco).'
            });
        }

        // Validación opcional de Apoderado Suplente
        if (apoderado_suplente && apoderado_suplente.rut_apoderado && !apoderado_suplente.nombres) {
            return res.status(400).json({
                success: false,
                message: 'Si registra un apoderado suplente, el nombre es obligatorio.'
            });
        }

        // Validación básica de dirección (Tabla direcciones_alumnos)
        if (!direccion || !direccion.id_comuna) {
            return res.status(400).json({
                success: false,
                message: 'La comuna es obligatoria para la dirección.'
            });
        }

        // Validación de salud (Tabla expediente_medico)
        if (!salud || !salud.sistema_salud) {
            return res.status(400).json({
                success: false,
                message: 'El sistema de salud (FONASA/ISAPRE) es obligatorio.'
            });
        }

        const id = await Matricula.create(req.body);
        res.status(201).json({ 
            success: true, 
            id, 
            message: 'Matrícula y asignación de electivos procesada correctamente.' 
        });
    } catch (error) {
        // Captura errores de Triggers (SQLSTATE 45000) definidos en el Script V3
        // Ej: 'fecha_retiro debe ser mayor a fecha_matricula' o 'No se puede reactivar una matrícula retirada'
        const isDbConstraint = error.sqlState === '45000' || error.code === 'ER_DUP_ENTRY';
        res.status(isDbConstraint ? 400 : 500).json({ 
            success: false, 
            message: isDbConstraint ? error.message : 'Error interno del servidor',
            error: error.message 
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

module.exports = { createMatricula, getReporteMatriculas };