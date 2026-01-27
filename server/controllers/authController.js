const User = require('../models/User');
const Condominio = require('../models/Condominio');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto_condogest';

const MASTER_KEY = 'ADMIN_MASTER_123'; 

exports.registar = async (req, res) => {
    try {
        const { nome, email, password, codigoAcesso, fracao } = req.body;

        const userExiste = await User.findOne({ email });
        if (userExiste) return res.status(400).json({ msg: 'Este email já está registado.' });

        let role = 'Inquilino';
        let condominioId = null;

        if (codigoAcesso === MASTER_KEY) {
            role = 'Admin';
        } else {
            const condominioEncontrado = await Condominio.findOne({ codigoAcesso });
            
            if (!condominioEncontrado) {
                return res.status(400).json({ msg: 'Código de acesso do prédio inválido.' });
            }
            condominioId = condominioEncontrado._id;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            nome,
            email,
            password: hashedPassword,
            role,
            condominio: condominioId,
            fracao: role === 'Admin' ? 'Escritório' : fracao, 
            codigoAcesso 
        });

        await newUser.save();
        
        res.status(201).json({ msg: 'Conta criada com sucesso! Podes fazer login.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no servidor ao registar.' });
    }
};

// 2. LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Credenciais inválidas.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Credenciais inválidas.' });

        const token = jwt.sign(
            { id: user._id, role: user.role, condominio: user.condominio },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                nome: user.nome,
                role: user.role,
                condominio: user.condominio
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('condominio');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVizinhos = async (req, res) => {
    try {
        const { condominioId } = req.params;
        
        const vizinhos = await User.find({ condominio: condominioId })
            .select('nome fracao role email') 
            .sort({ fracao: 1 }); 

        res.json(vizinhos);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar vizinhos" });
    }
};