const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Aberto', 'Resolvido', 'Arquivado'], 
        default: 'Aberto' 
    },
    // --- NOVO CAMPO AQUI ---
    prioridade: { 
        type: String, 
        enum: ['Baixa', 'Média', 'Alta', 'Urgente'], 
        default: 'Média' 
    },
    // -----------------------
    fotos: [{ type: String }],
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio' },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);