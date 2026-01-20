const mongoose = require('mongoose');

const ReuniaoSchema = new mongoose.Schema({
    titulo: { type: String, required: true }, // Ex: "Assembleia Geral"
    descricao: { type: String }, // Ex: "Discutir orçamento do telhado"
    data: { type: Date, required: true },
    local: { type: String, default: 'Hall de Entrada' },
    
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio', required: true },
    criador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // LISTAS DE RESPOSTAS (Guardamos os IDs dos utilizadores)
    confirmados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    recusados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Reuniao', ReuniaoSchema);