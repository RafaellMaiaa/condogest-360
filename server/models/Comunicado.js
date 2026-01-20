const mongoose = require('mongoose');

const ComunicadoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    mensagem: { type: String, required: true },
    tipo: { type: String, enum: ['Aviso', 'Reuniao'], default: 'Aviso' }, // Se for reunião, pede confirmação
    fotos: [{ type: String }],
    
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio' },
    
    // Quem já leu o aviso
    lidoPor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    // Para reuniões: quem vai e quem não vai
    vouEstar: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    naoVouEstar: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comunicado', ComunicadoSchema);