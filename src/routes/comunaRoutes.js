const express = require('express');
const router = express.Router();
const ComunaController = require('../controllers/ComunaController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken); // Protege todas las rutas de este archivo

router.get('/', ComunaController.getAllComunas);
router.get('/:id', ComunaController.getComunaById);
router.post('/', ComunaController.createComuna);
router.put('/:id', ComunaController.updateComuna);
router.delete('/:id', ComunaController.deleteComuna);

module.exports = router;