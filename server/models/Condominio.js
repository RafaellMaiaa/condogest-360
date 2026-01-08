const mongoose = require('mongoose');

const CondominioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nif: { type: String, required: true, unique: true },
  morada: { type: String, required: true },
  iban: { type: String, default: '' },
  
  // Campo Financeiro para cálculo de quotas
  orcamentoAnual: { 
    type: Number, 
    default: 0 
  },

  dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Condominio', CondominioSchema);