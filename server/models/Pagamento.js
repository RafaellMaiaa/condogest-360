const mongoose = require('mongoose');

const PagamentoSchema = new mongoose.Schema({
    inquilino: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    condominio: { type: mongoose.Schema.Types.ObjectId, ref: 'Condominio', required: true },
    valor: { type: Number, required: true },
    descricao: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pendente', 'Pago'], 
        default: 'Pendente' 
    },
    dataPagamento: { type: Date },
    

    numeroRecibo: { type: Number } 

}, { timestamps: true });

module.exports = mongoose.model('Pagamento', PagamentoSchema);