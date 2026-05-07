const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const { verifyToken } = require('../middlewares/auth');

router.post('/login', UsuarioController.login);
router.post('/', UsuarioController.createUsuario); // Público para pruebas, luego puedes protegerlo
router.post('/forgot-password', UsuarioController.forgotPassword);
router.post('/reset-password/:token', UsuarioController.resetPassword);

router.get('/', verifyToken, UsuarioController.getAllUsuarios);

module.exports = router;