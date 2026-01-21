const mongoose = require('mongoose'); // <--- ISTO ERA O QUE FALTAVA!
const Ticket = require('../models/Ticket');
const Pagamento = require('../models/Pagamento');

exports.getDashboardStats = async (req, res) => {
    try {
        const { condominioId } = req.params;
        console.log(`📊 Calculando stats para o condomínio: ${condominioId}`);

        // 1. Contar Tickets
        const totalTickets = await Ticket.countDocuments({ condominio: condominioId });
        const ticketsAbertos = await Ticket.countDocuments({ condominio: condominioId, status: 'Aberto' });
        const ticketsResolvidos = await Ticket.countDocuments({ condominio: condominioId, status: 'Resolvido' });

        // 2. Somar Pagamentos
        // Nota: O aggregate precisa do ObjectId, não pode ser string
        const objectId = new mongoose.Types.ObjectId(condominioId);

        const totalArrecadado = await Pagamento.aggregate([
            { $match: { condominio: objectId, status: 'Pago' } },
            { $group: { _id: null, total: { $sum: "$valor" } } }
        ]);

        const totalPendente = await Pagamento.aggregate([
            { $match: { condominio: objectId, status: 'Pendente' } },
            { $group: { _id: null, total: { $sum: "$valor" } } }
        ]);

        // Prepara os dados (se o array vier vazio, assume 0)
        const stats = {
            tickets: { 
                total: totalTickets, 
                abertos: ticketsAbertos, 
                resolvidos: ticketsResolvidos 
            },
            financeiro: { 
                arrecadado: totalArrecadado.length > 0 ? totalArrecadado[0].total : 0, 
                pendente: totalPendente.length > 0 ? totalPendente[0].total : 0 
            }
        };

        res.json(stats);

    } catch (error) {
        console.error("❌ ERRO CRÍTICO NAS STATS:", error); // Isto vai mostrar o erro no terminal
        res.status(500).json({ error: "Erro ao calcular estatísticas" });
    }
};