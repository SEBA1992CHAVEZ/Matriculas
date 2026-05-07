const express = require('express');
const router = express.Router();
const CursoController = require('../controllers/CursoController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', CursoController.getAllCursos);
router.post('/', CursoController.createCurso);
router.put('/:id', CursoController.updateCurso);
router.delete('/:id', CursoController.deleteCurso);

module.exports = router;