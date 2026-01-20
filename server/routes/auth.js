const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// ==========================================
// 🔐 AUTENTICAÇÃO
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { nome, email, password, role, fracaoId } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const novoUser = new User({
      nome, email, password: hashedPassword, role,
      fracao: fracaoId || null
    });

    const salvo = await novoUser.save();
    res.status(201).json({ msg: "Criado com sucesso", id: salvo._id });
  } catch (erro) { res.status(400).json({ erro: "Erro ao criar conta (Email duplicado?)" }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ erro: "Utilizador não encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ erro: "Senha incorreta" });

    res.json({ _id: user._id, nome: user.nome, email: user.email, role: user.role, fracao: user.fracao });
  } catch (erro) { res.status(500).json({ erro: erro.message }); }
});

module.exports = router;