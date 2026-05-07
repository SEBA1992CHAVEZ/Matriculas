const express = require('express');
const router = express.Router();
const MatriculaController = require('../controllers/MatriculaController');
const { verifyToken } = require('../middlewares/auth');

// Protegemos las rutas con el middleware de verificación de token
router.use(verifyToken);

router.post('/', MatriculaController.createMatricula);
router.get('/reporte', MatriculaController.getReporteMatriculas);
router.get('/stats', MatriculaController.getStats);

module.exports = router;