// server/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  condominio: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Condominio', 
    required: true 
  },
  fracao: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Fracao',
    default: null // Se for null, é uma mensagem GERAL para todos
  },
  assunto: { type: String, required: true },
  conteudo: { type: String, required: true },
  lida: { type: Boolean, default: false }, // Para futuro uso
  data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);