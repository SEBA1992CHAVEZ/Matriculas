const Apoderado = require('../models/Apoderado');

/**
 * Obtiene todos los apoderados o los apoderados asociados a un alumno específico.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 */
const getAllApoderados = async (req, res) => {
    try {
        const { id_alumno } = req.query; // Permite filtrar apoderados por alumno
        const apoderados = await Apoderado.getAll(id_alumno);
        res.status(200).json({ success: true, data: apoderados });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener apoderados', error: error.message });
    }
};

/**
 * Obtiene un apoderado por su ID.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 */
const getApoderadoById = async (req, res) => {
    try {
        const apoderado = await Apoderado.getById(req.params.id);
        if (!apoderado) {
            return res.status(404).json({ success: false, message: 'Apoderado no encontrado' });
        }
        res.status(200).json({ success: true, data: apoderado });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el apoderado', error: error.message });
    }
};

/**
 * Crea un nuevo apoderado.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 */
const createApoderado = async (req, res) => {
    const { rut_apoderado, nombres } = req.body;
    if (!rut_apoderado || !nombres) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios: rut_apoderado, nombres.' });
    }
    try {
        const id = await Apoderado.create(req.body);
        res.status(201).json({ success: true, id, message: 'Apoderado creado exitosamente.' });
    } catch (error) {
        const isDup = error.code === '23505'; // Código de violación de unicidad en Postgres
        res.status(isDup ? 400 : 500).json({ 
            success: false, 
            message: isDup ? 'El RUT del apoderado ya existe.' : 'Error al crear apoderado', 
            error: error.message 
        });
    }
};

/**
 * Actualiza un apoderado existente.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 */
const updateApoderado = async (req, res) => {
    const { nombres } = req.body;
    if (!nombres) {
        return res.status(400).json({ success: false, message: 'El campo "nombres" es obligatorio.' });
    }
    try {
        await Apoderado.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Apoderado actualizado correctamente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar apoderado', error: error.message });
    }
};

/**
 * Elimina un apoderado.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 */
const deleteApoderado = async (req, res) => {
    try {
        await Apoderado.delete(req.params.id);
        res.status(200).json({ success: true, message: 'Apoderado eliminado correctamente.' });
    } catch (error) {
        const isFkConstraint = error.code === '23503'; // Código de violación de llave foránea en Postgres
        res.status(isFkConstraint ? 400 : 500).json({ 
            success: false, 
            message: isFkConstraint ? 'No se puede eliminar el apoderado porque está asociado a uno o más alumnos.' : 'Error al eliminar apoderado', 
            error: error.message 
        });
    }
};

/**
 * Asocia un apoderado a un alumno con parentesco.
 */
const associateToAlumno = async (req, res) => {
    const { id_alumno, id_apoderado, id_parentesco, es_titular } = req.body;
    if (!id_alumno || !id_apoderado || !id_parentesco) {
        return res.status(400).json({ success: false, message: 'Faltan IDs de alumno, apoderado o parentesco.' });
    }
    try {
        await Apoderado.associateToAlumno(id_alumno, id_apoderado, id_parentesco, es_titular || false);
        res.status(201).json({ success: true, message: 'Apoderado asociado correctamente al alumno.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al asociar apoderado', error: error.message });
    }
};

module.exports = { 
    getAllApoderados, getApoderadoById, createApoderado, updateApoderado, deleteApoderado,
    associateToAlumno
};