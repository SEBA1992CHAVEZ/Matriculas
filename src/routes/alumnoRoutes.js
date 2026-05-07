const express = require('express');
const router = express.Router();
const AlumnoController = require('../controllers/AlumnoController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken); // Protege todas las rutas de este archivo

router.get('/', AlumnoController.getAllAlumnos);
router.post('/', AlumnoController.createAlumno);

module.exports = router;