const mongoose = require('mongoose');

const FracaoSchema = new mongoose.Schema({
  nome: { type: String, required: true }, // Ex: "1º Esq"
  
  condominio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Condominio',
    required: true
  },
  
  permilagem: {
    type: Number,
    required: true // Essencial para calcular a quota
  },
  
  tipo: {
    type: String,
    enum: ['Habitação', 'Comércio', 'Garagem', 'Arrecadação'],
    default: 'Habitação'
  },
  
  estado: {
    type: String,
    enum: ['Ocupado (Proprietário)', 'Arrendado', 'Vazio', 'Em Obras'],
    default: 'Ocupado (Proprietário)'
  }
});

module.exports = mongoose.model('Fracao', FracaoSchema);