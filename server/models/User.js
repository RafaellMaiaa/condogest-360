const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Admin', 'Inquilino'], 
        default: 'Inquilino' 
    },
    condominio: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Condominio' 
    },
    fracao: { type: String }, // Ex: "1º Esq"
    codigoAcesso: { type: String } // O código secreto da casa
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);