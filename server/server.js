const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// --- IMPORTAR MODELOS ---
// Certifica-te que tens os ficheiros na pasta models: 
// User.js, Condominio.js, Fracao.js, Ticket.js, Movimento.js, Message.js

const Condominio = require('./models/Condominio');
const Fracao = require('./models/Fracao');
const Ticket = require('./models/Ticket');
const Movimento = require('./models/Movimento');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Conexão MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado!'))
  .catch((err) => console.error('❌ Erro Mongo:', err));

app.get('/', (req, res) => res.send('API CondoGest 360 Online 🚀'));

// ==========================================
// 🔐 AUTENTICAÇÃO
// ==========================================
app.post('/api/auth/register', async (req, res) => {
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ erro: "Utilizador não encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ erro: "Senha incorreta" });

    res.json({ _id: user._id, nome: user.nome, email: user.email, role: user.role, fracao: user.fracao });
  } catch (erro) { res.status(500).json({ erro: erro.message }); }
});

// ==========================================
// 📬 MENSAGENS E AVISOS
// ==========================================
app.post('/api/messages', async (req, res) => {
  try {
    let { condominio, fracao, assunto, conteudo } = req.body;
    if (fracao === 'geral') fracao = null; // Mensagem para todos

    const nova = new Message({ condominio, fracao, assunto, conteudo });
    await nova.save();
    res.status(201).json(nova);
  } catch (erro) { res.status(400).json({ erro: erro.message }); }
});

// ==========================================
// 🛠️ TICKETS (CHAT E ESTADOS)
// ==========================================
app.post('/api/tickets', async (req, res) => {
  try { const novo = new Ticket(req.body); const salvo = await novo.save(); res.status(201).json(salvo); } 
  catch (e) { res.status(400).json({ erro: e.message }); }
});

app.get('/api/tickets/:condominioId', async (req, res) => {
  try { const lista = await Ticket.find({ condominio: req.params.condominioId }).sort({ dataCriacao: -1 }); res.json(lista); } 
  catch (e) { res.status(500).json({ erro: e.message }); }
});

// Atualizar Estado (Aberto -> Concluído)
app.put('/api/tickets/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const atualizado = await Ticket.findByIdAndUpdate(req.params.id, { estado }, { new: true });
    res.json(atualizado);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// Adicionar Comentário (Com verificação de bloqueio)
app.post('/api/tickets/:id/comentarios', async (req, res) => {
  try {
    const { texto, autor } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) return res.status(404).json({ erro: "Ticket não encontrado" });

    // 🔒 SEGURANÇA: Se estiver concluído, bloqueia
    if (ticket.estado === 'Concluído') {
      return res.status(403).json({ erro: "Este ticket está fechado. Não é possível comentar." });
    }

    ticket.comentarios.push({ texto, autor });
    await ticket.save();
    
    res.json(ticket);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// ==========================================
// 🏠 DADOS DASHBOARD INQUILINO
// ==========================================
app.get('/api/inquilino/dados/:fracaoId', async (req, res) => {
  try {
    const fracaoId = req.params.fracaoId;
    
    // 1. Fração
    const fracao = await Fracao.findById(fracaoId).populate('condominio');
    if (!fracao) return res.status(404).json({erro: 'Fração não encontrada'});

    // 2. Pagamentos
    const pagamentos = await Movimento.find({ fracao: fracaoId, tipo: 'Pagamento' }).sort({data: -1});
    
    // 3. Tickets
    const tickets = await Ticket.find({ condominio: fracao.condominio._id }).sort({dataCriacao: -1});

    // 4. Mensagens
    const mensagens = await Message.find({
      condominio: fracao.condominio._id,
      $or: [ { fracao: fracaoId }, { fracao: null } ]
    }).sort({ data: -1 });

    res.json({ fracao, condominio: fracao.condominio, pagamentos, tickets, mensagens });
  } catch (erro) { res.status(500).json({ erro: erro.message }); }
});

// ==========================================
// 🏢 ADMINISTRAÇÃO GERAL (CRUDs Básicos)
// ==========================================
app.post('/api/condominios', async (req, res) => { try{const n=new Condominio(req.body); await n.save(); res.status(201).json(n);}catch(e){res.status(400).json(e);} });
app.get('/api/condominios', async (req, res) => { try{const l=await Condominio.find().sort({dataCriacao:-1}); res.json(l);}catch(e){res.status(500).json(e);} });
app.put('/api/condominios/:id', async (req, res) => { try{const a=await Condominio.findByIdAndUpdate(req.params.id, req.body, {new:true}); res.json(a);}catch(e){res.status(500).json(e);} });

app.post('/api/fracoes', async (req, res) => { try{const n=new Fracao(req.body); await n.save(); res.status(201).json(n);}catch(e){res.status(400).json(e);} });
app.get('/api/fracoes/:condominioId', async (req, res) => { 
  try {
    const lista = await Fracao.find({ condominio: req.params.condominioId });
    const listaFinal = await Promise.all(lista.map(async f => {
      const moves = await Movimento.find({ fracao: f._id });
      const total = moves.filter(m=>m.tipo==='Pagamento').reduce((acc,m)=>acc+m.valor,0);
      return {...f.toObject(), totalPago: total};
    }));
    res.json(listaFinal);
  } catch(e){res.status(500).json(e);} 
});

app.post('/api/movimentos', async (req, res) => {
  try {
    let dados = req.body;
    if (dados.tipo === 'Pagamento') {
      const count = await Movimento.countDocuments({ tipo: 'Pagamento' });
      dados.numeroRecibo = count + 1;
    }
    const novo = new Movimento(dados);
    const salvo = await novo.save();
    await salvo.populate('fracao');
    res.status(201).json(salvo);
  } catch(e){res.status(400).json(e);}
});

app.get('/api/movimentos/historico/:condominioId', async (req, res) => {
  try {
    const fracoes = await Fracao.find({ condominio: req.params.condominioId }).select('_id');
    const ids = fracoes.map(f => f._id);
    const hist = await Movimento.find({ fracao: { $in: ids }, tipo: 'Pagamento' }).populate('fracao').sort({ numeroRecibo: -1 });
    res.json(hist);
  } catch(e){res.status(500).json(e);}
});

app.listen(PORT, () => console.log(`📡 Servidor a correr na porta: ${PORT}`));