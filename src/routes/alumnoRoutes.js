const express = require('express');
const router = express.Router();
const AlumnoController = require('../controllers/AlumnoController');
const MatriculaController = require('../controllers/MatriculaController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken); // Protege todas las rutas de este archivo

router.get('/', AlumnoController.getAllAlumnos);
router.post('/', AlumnoController.createAlumno);

// Nueva ruta para verificar si el alumno existe por su RUT
router.get('/check/:rut', MatriculaController.checkStudent);

module.exports = router;