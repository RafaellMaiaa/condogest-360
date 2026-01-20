const Pagamento = require('../models/Pagamento');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

// 1. CRIAR AVISO DE PAGAMENTO (Admin lança a quota)
exports.criarPagamento = async (req, res) => {
    try {
        const { inquilinoId, valor, descricao, condominioId } = req.body;
        
        const novoPagamento = new Pagamento({
            inquilino: inquilinoId,
            condominio: condominioId,
            valor: valor,
            descricao: descricao,
            status: 'Pendente'
        });

        await novoPagamento.save();
        res.status(201).json(novoPagamento);
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar pagamento" });
    }
};

// 2. LISTAR PAGAMENTOS (Do Prédio)
exports.listar = async (req, res) => {
    try {
        const { condominioId } = req.params;
        // Se for Admin vê tudo, se for Inquilino vê só os seus
        let query = { condominio: condominioId };
        if (req.user.role !== 'Admin') {
            query.inquilino = req.user.id;
        }

        const pagamentos = await Pagamento.find(query)
            .populate('inquilino', 'nome fracao')
            .sort({ createdAt: -1 });

        res.json(pagamentos);
    } catch (error) {
        res.status(500).json(error);
    }
};

// 3. REGISTAR QUE FOI PAGO (Admin confirma e define valor final)
exports.marcarPago = async (req, res) => {
    try {
        const { valorPago } = req.body; // O Admin pode ajustar o valor na hora
        
        const pagamento = await Pagamento.findByIdAndUpdate(req.params.id, {
            status: 'Pago',
            valor: valorPago, // Atualiza com o valor real que o admin recebeu
            dataPagamento: new Date()
        }, { new: true });

        res.json(pagamento);
    } catch (error) {
        res.status(500).json({ error: "Erro ao confirmar pagamento" });
    }
};

// 4. GERAR PDF DO RECIBO 📄
exports.downloadRecibo = async (req, res) => {
    try {
        const pagamento = await Pagamento.findById(req.params.id)
            .populate('inquilino', 'nome fracao NIF')
            .populate('condominio', 'nome morada');

        if (!pagamento || pagamento.status !== 'Pago') {
            return res.status(400).json({ msg: "Recibo indisponível (Ainda não pago)" });
        }

        // --- INÍCIO DA CRIAÇÃO DO PDF ---
        const doc = new PDFDocument();

        // Configurar cabeçalhos para o browser entender que é um download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Recibo-${pagamento._id}.pdf`);

        doc.pipe(res); // Envia o PDF diretamente para a resposta

        // Desenhar o PDF
        doc.fontSize(20).text('RECIBO DE PAGAMENTO', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12).text(`Condomínio: ${pagamento.condominio.nome}`);
        doc.text(`Morada: ${pagamento.condominio.morada}`);
        doc.moveDown();
        doc.text('------------------------------------------------------');
        doc.moveDown();

        doc.fontSize(14).text(`Recebemos de: ${pagamento.inquilino.nome}`);
        doc.text(`Fração: ${pagamento.inquilino.fracao}`);
        doc.moveDown();

        doc.fontSize(16).text(`A quantia de: ${pagamento.valor} €`);
        doc.fontSize(12).text(`Referente a: ${pagamento.descricao}`);
        
        doc.moveDown(2);
        doc.fontSize(10).text(`Data do Pagamento: ${pagamento.dataPagamento.toLocaleDateString()}`);
        doc.text(`Emitido em: ${new Date().toLocaleString()}`);
        
        doc.moveDown(4);
        doc.text('_________________________', { align: 'center' });
        doc.text('O Administrador', { align: 'center' });

        doc.end(); // Fecha o PDF e envia
        // --- FIM DO PDF ---

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao gerar PDF" });
    }
};