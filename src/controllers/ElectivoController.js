const Electivo = require('../models/Electivo');

const getElectivos = async (req, res) => {
    try {
        const electivos = await Electivo.getAll();
        res.status(200).json({ success: true, data: electivos });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener electivos', error: error.message });
    }
};

module.exports = { getElectivos };