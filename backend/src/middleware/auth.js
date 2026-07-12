const jwt = require('jsonwebtoken');

const optionalAuth = function (req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        const tokenParts = token.split(' ');
        const tokenValue = tokenParts.length === 2 ? tokenParts[1] : token;
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET || 'secret');
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

const requireAuth = function (req, res, next) {
    optionalAuth(req, res, () => {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado. Token requerido.' });
        }
        next();
    });
};

module.exports = { optionalAuth, requireAuth };
