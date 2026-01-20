const User = require('../models/User');
const Condominio = require('../models/Condominio');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto_condogest';
// Este é o código que TU usas para criar a primeira conta de ADMIN
const MASTER_KEY = 'ADMIN_MASTER_123'; 

// 1. REGISTAR (Cria conta e liga ao prédio correto)
exports.registar = async (req, res) => {
    try {
        const { nome, email, password, codigoAcesso, fracao } = req.body;

        // A. Verificar se email já existe
        const userExiste = await User.findOne({ email });
        if (userExiste) return res.status(400).json({ msg: 'Este email já está registado.' });

        let role = 'Inquilino';
        let condominioId = null;

        // B. Verificar o Código de Acesso
        if (codigoAcesso === MASTER_KEY) {
            // É um Admin a registar-se com a chave mestra
            role = 'Admin';
        } else {
            // É um Inquilino? Procurar o prédio pelo código
            const condominioEncontrado = await Condominio.findOne({ codigoAcesso });
            
            if (!condominioEncontrado) {
                return res.status(400).json({ msg: 'Código de acesso do prédio inválido.' });
            }
            condominioId = condominioEncontrado._id;
        }

        // C. Encriptar Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // D. Criar Utilizador
        const newUser = new User({
            nome,
            email,
            password: hashedPassword,
            role,
            condominio: condominioId,
            fracao: role === 'Admin' ? 'Escritório' : fracao, // Se for admin não precisa de fração
            codigoAcesso // Guardamos o código usado por referência
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

// 3. OBTER DADOS DO USER (Me)
exports.getMe = async (req, res) => {
    try {
        // Traz também os dados do condomínio (nome, morada)
        const user = await User.findById(req.user.id).select('-password').populate('condominio');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. LISTAR VIZINHOS POR CONDOMÍNIO (Para o Admin selecionar quem paga)
exports.getVizinhos = async (req, res) => {
    try {
        const { condominioId } = req.params;
        
        // Busca users desse prédio (exceto quem fez o pedido, se quiseres)
        const vizinhos = await User.find({ condominio: condominioId })
            .select('nome fracao role email') // Traz apenas dados essenciais
            .sort({ fracao: 1 }); // Ordena por andar (1º, 2º, 3º...)

        res.json(vizinhos);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar vizinhos" });
    }
};