const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <TOKEN>

    if (!token) {
        return res.status(403).json({ success: false, message: 'Se requiere un token para la autenticación.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_provisoria');
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token no válido o expirado.' });
    }
};

module.exports = { verifyToken };
