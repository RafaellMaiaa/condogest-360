// server/models/Movimento.js
const mongoose = require('mongoose');

const MovimentoSchema = new mongoose.Schema({
  fracao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fracao',
    required: true
  },
  tipo: {
    type: String,
    enum: ['Pagamento', 'Quota Mensal', 'Acerto'],
    required: true
  },
  valor: {
    type: Number,
    required: true
  },
  // NOVO: Número sequencial do recibo
  numeroRecibo: {
    type: Number
  },
  data: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Movimento', MovimentoSchema);