const express = require('express');
const router = express.Router();
const MatriculaController = require('../controllers/MatriculaController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.post('/', MatriculaController.createMatricula);
router.get('/reportes', MatriculaController.getReporteMatriculas);

module.exports = router;