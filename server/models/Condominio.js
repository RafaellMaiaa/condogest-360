const mongoose = require('mongoose');

const CondominioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    morada: { type: String, required: true },
    codigoAcesso: { type: String, unique: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
}, { timestamps: true });

module.exports = mongoose.model('Condominio', CondominioSchema);