const mongoose = require('mongoose');

const ReuniaoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descricao: { type: String }, 
    data: { type: Date, required: true },
    local: { type: String, default: 'Hall de Entrada' },
    
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio', required: true },
    criador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    confirmados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    recusados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Reuniao', ReuniaoSchema);