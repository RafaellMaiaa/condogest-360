const mongoose = require('mongoose');

const AvisoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    mensagem: { type: String, required: true },
    tipo: { type: String, enum: ['Geral', 'Evento'], default: 'Geral' },
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio' },
    

    vou: [{ type: String }], 
    naoVou: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Aviso', AvisoSchema);