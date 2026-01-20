// server/models/Ticket.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  
  condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio', required: true },
  
  prioridade: { type: String, enum: ['Baixa', 'Média', 'Alta', 'Urgente'], default: 'Média' },
  
  // ESTADO DA AVARIA
 estado: { 
        type: String, 
        enum: ['Pendente', 'Em Resolução', 'Concluído', 'Arquivado'], 
        default: 'Pendente' 
    },
    fotos: [{ type: String }], // Novo: Array com os caminhos das imagens
    deletedAt: { type: Date, default: null }, // Novo: Data de eliminação (Soft Delete)
  zona: { type: String, default: 'Geral' },
  componente: { type: String, default: 'Outro' },

  // --- NOVO: CHAT DENTRO DO TICKET ---
  comentarios: [{
    texto: String,
    autor: String, // "Admin" ou "Inquilino"
    data: { type: Date, default: Date.now }
  }],
  // -----------------------------------

  dataCriacao: { type: Date, default: Date.now },
    inquilino: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio', required: true }
});

module.exports = mongoose.model('Ticket', TicketSchema);