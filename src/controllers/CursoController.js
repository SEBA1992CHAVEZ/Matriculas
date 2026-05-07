const Curso = require('../models/Curso');

const getAllCursos = async (req, res) => {
    try {
        const data = await Curso.getAll();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createCurso = async (req, res) => {
    try {
        const id = await Curso.create(req.body);
        res.status(201).json({ success: true, id });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error: El curso ya existe o datos inválidos.' });
    }
};

const updateCurso = async (req, res) => {
    try {
        await Curso.update(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Curso actualizado' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteCurso = async (req, res) => {
    try {
        await Curso.delete(req.params.id);
        res.status(200).json({ success: true, message: 'Curso eliminado' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'No se puede eliminar: tiene matrículas asociadas.' });
    }
};

module.exports = { getAllCursos, createCurso, updateCurso, deleteCurso };