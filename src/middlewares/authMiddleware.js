const jwt = require('jsonwebtoken');
const AppError = require('../shared/errors/AppError');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new AppError('Token de acesso não fornecido.', 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        throw new AppError('Token inválido ou expirado.', 401);
    }
};

module.exports = authMiddleware;
