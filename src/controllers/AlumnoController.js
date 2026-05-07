const Alumno = require('../models/Alumno');

const getAllAlumnos = async (req, res) => {
    try {
        const alumnos = await Alumno.getAll();
        res.status(200).json(alumnos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener alumnos', error: error.message });
    }
};

const createAlumno = async (req, res) => {
    const { rut_estudiante, nombres, apellido_paterno } = req.body;

    if (!rut_estudiante || !nombres || !apellido_paterno) {
        return res.status(400).json({ 
            message: 'Faltan campos obligatorios: rut_estudiante, nombres, apellido_paterno.' 
        });
    }

    try {
        const id = await Alumno.create(req.body);
        res.status(201).json({ id, message: 'Alumno registrado exitosamente' });
    } catch (error) {
        // Captura de errores de RUT duplicado o estados de SQL personalizados
        const isDbConstraint = error.sqlState === '45000' || error.code === 'ER_DUP_ENTRY';
        res.status(isDbConstraint ? 400 : 500).json({ 
            message: isDbConstraint ? error.message : 'Error interno al crear alumno', 
            error: error.message 
        });
    }
};

module.exports = { getAllAlumnos, createAlumno };
