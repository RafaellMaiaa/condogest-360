const mongoose = require('mongoose');

const DocumentoSchema = new mongoose.Schema({
    titulo: { type: String, required: true }, 
    caminho: { type: String, required: true }, 
    tipo: { type: String, default: 'pdf' },
    
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio', required: true },
    criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Documento', DocumentoSchema);