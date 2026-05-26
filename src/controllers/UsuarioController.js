const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.getAll();
        res.status(200).json({ success: true, data: usuarios });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener usuarios', error: error.message });
    }
};

const createUsuario = async (req, res) => {
    const { username, password, nombre_real, id_role } = req.body;

    // Validaciones básicas de campos obligatorios según el script SQL
    if (!username || !password || !id_role) {
        return res.status(400).json({ 
            success: false, 
            message: 'Faltan campos obligatorios: username, password, id_role.' 
        });
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);
        
        const id = await Usuario.create({
            ...req.body,
            password_hash
        });

        res.status(201).json({ success: true, id, message: 'Usuario creado exitosamente.' });
    } catch (error) {
        const errorMap = {
            '23505': 'El nombre de usuario ya existe.',
            '23514': 'El usuario debe tener al menos 4 caracteres.',
            '23503': 'El rol especificado no es válido.',
        };
        
        const message = errorMap[error.code] || (error.code === 'P0001' ? error.message : 'Error interno del servidor');
        const statusCode = (errorMap[error.code] || error.code === 'P0001') ? 400 : 500;

        res.status(statusCode).json({
            success: false,
            message,
            error: error.message
        });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos.' });
    }

    try {
        const usuario = await Usuario.getByUsername(username);

        if (!usuario) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
        }

        const isMatch = await bcrypt.compare(password, usuario.password_hash);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }

        // Generar JWT
        const token = jwt.sign(
            { 
                id: usuario.id_usuario, 
                username: usuario.username, 
                id_role: usuario.id_role
            },
            process.env.JWT_SECRET || 'clave_secreta_provisoria',
            { expiresIn: '8h' }
        );

        res.status(200).json({ success: true, token, message: 'Login exitoso.' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el proceso de login', error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { username } = req.body;
    try {
        const usuario = await Usuario.getByUsername(username);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'El usuario no existe en el sistema.' });
        }

        // Generar token aleatorio
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora de validez

        await Usuario.saveResetToken(usuario.id_usuario, token, expires);

        res.status(200).json({ 
            success: true, 
            message: 'Token generado (Modo Desarrollo)', 
            token: token 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const usuario = await Usuario.getByResetToken(token);
        if (!usuario) {
            return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        await Usuario.updatePassword(usuario.id_usuario, password_hash);

        res.status(200).json({ success: true, message: 'Contraseña actualizada con éxito' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al resetear contraseña', error: error.message });
    }
};

module.exports = { 
    getAllUsuarios, 
    createUsuario, 
    login, 
    forgotPassword, 
    resetPassword 
};