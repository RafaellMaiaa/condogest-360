const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    prioridade: { type: String, enum: ['Baixa', 'Média', 'Alta', 'Urgente'], default: 'Média' },
    status: { type: String, enum: ['Aberto', 'Em Progresso', 'Resolvido', 'Arquivado'], default: 'Aberto' },
    fotos: [{ type: String }],
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio' },
    deletedAt: { type: Date, default: null },

    // NOVO: Array de Comentários (Chat)
    comentarios: [{
        texto: String,
        autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);