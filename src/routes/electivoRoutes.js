const express = require('express');
const router = express.Router();
const ElectivoController = require('../controllers/ElectivoController');
const { verifyToken } = require('../middlewares/auth');

// Definimos la ruta GET para obtener todos los electivos
// Al usar verifyToken, aseguramos que la petición sea legítima
router.get('/', verifyToken, ElectivoController.getElectivos);

module.exports = router;