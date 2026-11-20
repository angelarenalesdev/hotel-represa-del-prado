const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const Usuario = require('../models/Usuario');
            req.usuario = await Usuario.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'No autorizado, token inválido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, sin token' });
    }
};

const admin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
    }
};

module.exports = { protect, admin };
