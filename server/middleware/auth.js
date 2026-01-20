const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto_condogest';

module.exports = function(req, res, next) {
    // Ler o token do header
    const token = req.header('x-auth-token');

    // Se não há token
    if (!token) {
        return res.status(401).json({ msg: 'Sem token, autorização negada' });
    }

    try {
        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Adiciona os dados do user ao pedido
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token inválido' });
    }
};