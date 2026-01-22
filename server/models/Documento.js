const mongoose = require('mongoose');

const DocumentoSchema = new mongoose.Schema({
    titulo: { type: String, required: true }, // Ex: "Ata Reunião Jan 2024"
    caminho: { type: String, required: true }, // Onde está o ficheiro
    tipo: { type: String, default: 'pdf' },
    
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio', required: true },
    criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Documento', DocumentoSchema);