const express = require('express');
const router = express.Router();
const ApoderadoController = require('../controllers/ApoderadoController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken); // Protege todas las rutas de este archivo

router.get('/', ApoderadoController.getAllApoderados);
router.post('/asociar', ApoderadoController.associateToAlumno); // Mover arriba de las rutas con parámetros
router.get('/:id', ApoderadoController.getApoderadoById);
router.post('/', ApoderadoController.createApoderado);
router.put('/:id', ApoderadoController.updateApoderado);
router.delete('/:id', ApoderadoController.deleteApoderado);

module.exports = router;