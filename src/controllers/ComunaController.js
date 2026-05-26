const Comuna = require('../models/Comuna');

const getAllComunas = async (req, res) => {
    try {
        const data = await Comuna.getAll();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener comunas', error: error.message });
    }
};

const getComunaById = async (req, res) => {
    try {
        const comuna = await Comuna.getById(req.params.id);
        if (!comuna) {
            return res.status(404).json({ success: false, message: 'Comuna no encontrada' });
        }
        res.status(200).json({ success: true, data: comuna });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener la comuna', error: error.message });
    }
};

const createComuna = async (req, res) => {
    const { nombre_comuna, region } = req.body;
    if (!nombre_comuna || !region) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios: nombre_comuna, region.' });
    }
    try {
        const id = await Comuna.create(req.body);
        res.status(201).json({ success: true, id, message: 'Comuna creada exitosamente.' });
    } catch (error) {
        const isDup = error.code === '23505';
        res.status(isDup ? 400 : 500).json({ 
            success: false, 
            message: isDup ? 'Ya existe esta comuna.' : 'Error al crear comuna', 
            error: error.message 
        });
    }
};

const updateComuna = async (req, res) => {
    const { nombre_comuna, region } = req.body;
    if (!nombre_comuna || !region) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios: nombre_comuna, region.' });
    }
    try {
        await Comuna.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Comuna actualizada correctamente.' });
    } catch (error) {
        const isDup = error.code === '23505';
        res.status(isDup ? 400 : 500).json({ 
            success: false, 
            message: isDup ? 'Ya existe esta comuna.' : 'Error al actualizar comuna', 
            error: error.message 
        });
    }
};

const deleteComuna = async (req, res) => {
    try {
        await Comuna.delete(req.params.id);
        res.status(200).json({ success: true, message: 'Comuna eliminada correctamente.' });
    } catch (error) {
        const isFkConstraint = error.code === '23503';
        res.status(isFkConstraint ? 400 : 500).json({ 
            success: false, 
            message: isFkConstraint ? 'No se puede eliminar la comuna porque está asociada a instituciones o alumnos.' : 'Error al eliminar comuna', 
            error: error.message 
        });
    }
};

module.exports = { 
    getAllComunas, 
    getComunaById, 
    createComuna, 
    updateComuna, 
    deleteComuna 
};