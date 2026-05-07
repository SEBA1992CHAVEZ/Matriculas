const express = require('express');
const router = express.Router();
const NivelController = require('../controllers/NivelController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', NivelController.getAllNiveles);
router.post('/', NivelController.createNivel);
router.put('/:id', NivelController.updateNivel);
router.delete('/:id', NivelController.deleteNivel);

module.exports = router;