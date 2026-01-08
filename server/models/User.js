// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // O "role" define se é Gestor ou Inquilino
  role: { 
    type: String, 
    enum: ['admin', 'inquilino'], 
    default: 'inquilino' 
  },

  // Se for inquilino, ligamos a uma fração específica
  fracao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fracao'
  },
  
  dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);