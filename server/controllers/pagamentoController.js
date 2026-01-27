const Pagamento = require('../models/Pagamento');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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

exports.listar = async (req, res) => {
    try {
        const { condominioId } = req.params;
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

exports.marcarPago = async (req, res) => {
    try {
        const { valorPago } = req.body;
        const pagamentoId = req.params.id;

        const pagamentoAtual = await Pagamento.findById(pagamentoId);
        if (!pagamentoAtual) return res.status(404).json({ msg: "Pagamento não encontrado" });

        const ultimoPagamento = await Pagamento.findOne({ 
            condominio: pagamentoAtual.condominio,
            numeroRecibo: { $exists: true } 
        }).sort({ numeroRecibo: -1 });

        const proximoNumero = ultimoPagamento && ultimoPagamento.numeroRecibo 
            ? ultimoPagamento.numeroRecibo + 1 
            : 1;

        const pagamentoAtualizado = await Pagamento.findByIdAndUpdate(pagamentoId, {
            status: 'Pago',
            valor: valorPago,
            dataPagamento: new Date(),
            numeroRecibo: proximoNumero
        }, { new: true });

        res.json(pagamentoAtualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao confirmar pagamento" });
    }
};
exports.downloadRecibo = async (req, res) => {
    try {
        const pagamento = await Pagamento.findById(req.params.id)
            .populate('inquilino', 'nome fracao email')
            .populate('condominio', 'nome morada');

        if (!pagamento || pagamento.status !== 'Pago') {
            return res.status(400).json({ msg: "Recibo indisponível" });
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        const colorPrimary = '#0F4C81';
        const colorSecondary = '#4DB6AC';
        const colorText = '#333333';
        const colorLight = '#F4F7F6';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Recibo-${pagamento.numeroRecibo}.pdf`);
        doc.pipe(res);

        const logoPath = path.join(__dirname, '../assets/logo.png');
        if (fs.existsSync(logoPath)) {
            doc.save(); 
            
            doc.opacity(0.15); 
            doc.image(logoPath, 0, 200, {
                fit: [595, 400],
                align: 'center',
                valign: 'center'
            });
            
            doc.restore(); 
        }

        doc.rect(0, 0, 595, 120).fill(colorPrimary);
        
        doc.fillColor('white').fontSize(26).font('Helvetica-Bold')
           .text('RECIBO DE PAGAMENTO', 50, 40);
        
        const numeroFormatado = String(pagamento.numeroRecibo).padStart(4, '0');
        doc.fontSize(12).font('Helvetica')
           .text(`RECIBO Nº ${numeroFormatado}`, 50, 80);
        
        doc.text(`DATA: ${new Date().toLocaleDateString('pt-PT')}`, 50, 95);

        if (!fs.existsSync(logoPath)) {
             doc.fontSize(16).fillColor('white').text('CondoGest', 450, 40, { align: 'right' });
        }

        const startY = 160;

        doc.fillColor(colorText);
        doc.fontSize(10).font('Helvetica-Bold').text('EMITIDO POR:', 50, startY);
        doc.font('Helvetica').text(pagamento.condominio.nome, 50, startY + 15);
        doc.text(pagamento.condominio.morada, 50, startY + 30);

        // Coluna Direita: Inquilino
        doc.font('Helvetica-Bold').text('RECEBEMOS DE:', 300, startY);
        doc.font('Helvetica').text(pagamento.inquilino.nome, 300, startY + 15);
        doc.text(`Fração: ${pagamento.inquilino.fracao}`, 300, startY + 30);
        doc.text(`Email: ${pagamento.inquilino.email}`, 300, startY + 45);

        // --- 3. TABELA ---
        const tableTop = 260;
        doc.rect(50, tableTop, 495, 30).fill(colorLight);
        doc.fillColor(colorPrimary).font('Helvetica-Bold').fontSize(12);
        
        doc.text('DESCRIÇÃO', 60, tableTop + 8);
        doc.text('DATA PAGAMENTO', 300, tableTop + 8);
        doc.text('VALOR', 450, tableTop + 8, { width: 90, align: 'right' });

        const rowTop = tableTop + 40;
        doc.fillColor(colorText).font('Helvetica').fontSize(12);
        
        doc.text(pagamento.descricao, 60, rowTop);
        doc.text(new Date(pagamento.dataPagamento).toLocaleDateString('pt-PT'), 300, rowTop);
        doc.text(`${pagamento.valor.toFixed(2)} €`, 450, rowTop, { width: 90, align: 'right' });

        doc.moveTo(50, rowTop + 20).lineTo(545, rowTop + 20).strokeColor('#cccccc').stroke();

        // --- 4. TOTAL ---
        const totalTop = rowTop + 40;
        doc.rect(350, totalTop, 195, 40).fill(colorSecondary);
        
        doc.fillColor('white').fontSize(14).font('Helvetica-Bold');
        doc.text('TOTAL PAGO', 370, totalTop + 12);
        doc.text(`${pagamento.valor.toFixed(2)} €`, 450, totalTop + 12, { width: 90, align: 'right' });

        // --- 5. RODAPÉ ---
        const footerTop = 650;
        doc.fillColor(colorText).fontSize(10).font('Helvetica');
        doc.text('Este documento não serve como comprovativo de pagamento.', 50, footerTop, { align: 'center' });
        doc.moveTo(150, footerTop + 60).lineTo(445, footerTop + 60).strokeColor('black').stroke();
        doc.text('A Administração', 50, footerTop + 70, { align: 'center' });

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao gerar PDF" });
    }
};