const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Aberto', 'Resolvido', 'Arquivado'], 
        default: 'Aberto' 
    },
    // Array de strings para guardar os caminhos das fotos
    fotos: [{ type: String }],
    
    // IDs para ligação (Relacionamentos)
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Quem criou
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio' }, // A que prédio pertence
    
    // Campo mágico para o Soft Delete (se tiver data, está "apagado")
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);