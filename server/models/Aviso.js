const mongoose = require('mongoose');

const AvisoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    mensagem: { type: String, required: true },
    tipo: { type: String, enum: ['Geral', 'Evento'], default: 'Geral' },
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio' },
    
    // Arrays para guardar quem vai e quem não vai (RSVP)
    vou: [{ type: String }], // Guardamos os IDs dos users aqui
    naoVou: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Aviso', AvisoSchema);