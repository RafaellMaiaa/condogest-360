const mongoose = require('mongoose');

const PagamentoSchema = new mongoose.Schema({
    inquilino: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio', required: true },
    valor: { type: Number, required: true },
    descricao: { type: String, required: true }, // Ex: "Quota Janeiro 2024"
    status: { 
        type: String, 
        enum: ['Pendente', 'Pago'], 
        default: 'Pendente' 
    },
    dataPagamento: { type: Date } // Data em que o Admin confirmou
}, { timestamps: true });

module.exports = mongoose.model('Pagamento', PagamentoSchema);