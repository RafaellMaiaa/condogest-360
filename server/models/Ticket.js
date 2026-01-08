// server/models/Ticket.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  
  condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio', required: true },
  
  prioridade: { type: String, enum: ['Baixa', 'Média', 'Alta', 'Urgente'], default: 'Média' },
  
  // ESTADO DA AVARIA
  estado: { type: String, enum: ['Aberto', 'Em Resolução', 'Concluído'], default: 'Aberto' },

  zona: { type: String, default: 'Geral' },
  componente: { type: String, default: 'Outro' },

  // --- NOVO: CHAT DENTRO DO TICKET ---
  comentarios: [{
    texto: String,
    autor: String, // "Admin" ou "Inquilino"
    data: { type: Date, default: Date.now }
  }],
  // -----------------------------------

  dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', TicketSchema);