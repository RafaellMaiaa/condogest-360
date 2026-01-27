const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto_condogest';

module.exports = function(req, res, next) {

    const token = req.header('x-auth-token');


    if (!token) {
        return res.status(401).json({ msg: 'Sem token, autorização negada' });
    }

    try {

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token inválido' });
    }
};