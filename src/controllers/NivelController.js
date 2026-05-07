const Nivel = require('../models/Nivel');

const getAllNiveles = async (req, res) => {
    try {
        const data = await Nivel.getAll();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createNivel = async (req, res) => {
    try {
        const id = await Nivel.create(req.body);
        res.status(201).json({ success: true, id });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateNivel = async (req, res) => {
    try {
        await Nivel.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Nivel actualizado' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteNivel = async (req, res) => {
    try {
        await Nivel.delete(req.params.id);
        res.status(200).json({ success: true, message: 'Nivel eliminado' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'No se puede eliminar: el nivel está en uso.' });
    }
};

module.exports = { getAllNiveles, createNivel, updateNivel, deleteNivel };