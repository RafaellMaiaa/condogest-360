import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Download, CheckCircle, Clock, Plus, Euro, Building, User } from 'lucide-react';

const API_URL = "http://localhost:5001";

export default function Pagamentos() {
  const { user } = useContext(AuthContext);
  const [pagamentos, setPagamentos] = useState([]);
  
  // Dados do Admin
  const [meusCondominios, setMeusCondominios] = useState([]);
  const [condominioSelecionado, setCondominioSelecionado] = useState(null);
  const [listaVizinhos, setListaVizinhos] = useState([]); // Lista para o Select

  // Modais
  const [showCriar, setShowCriar] = useState(false); // Modal de Criar
  const [showConfirmar, setShowConfirmar] = useState(null); // Modal de Validar
  
  // Formulário Criar Pagamento
  const [novoInquilinoId, setNovoInquilinoId] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');

  // Formulário Validar
  const [valorRecebido, setValorRecebido] = useState('');

  // 1. CARREGAR PRÉDIOS (Se for Admin)
  useEffect(() => {
    if (!user) return;
    const carregarTudo = async () => {
        const token = localStorage.getItem('token');
        if (user.role === 'Admin') {
            try {
                const res = await axios.get(`${API_URL}/api/condominios`, { headers: { 'x-auth-token': token } });
                setMeusCondominios(res.data);
                if (res.data.length > 0) setCondominioSelecionado(res.data[0]._id);
            } catch (err) { console.error("Erro a carregar prédios"); }
        } else {
            setCondominioSelecionado(user.condominio._id || user.condominio);
        }
    };
    carregarTudo();
  }, [user]);

  // 2. CARREGAR PAGAMENTOS E VIZINHOS (Quando muda o prédio)
  useEffect(() => {
    if (condominioSelecionado) {
        carregarPagamentos();
        if (user.role === 'Admin') {
            carregarVizinhos();
        }
    }
  }, [condominioSelecionado]);

  const carregarPagamentos = async () => {
    try {
        const res = await axios.get(`${API_URL}/api/pagamentos/${condominioSelecionado}`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setPagamentos(res.data);
    } catch (err) { console.error("Erro pagamentos"); }
  };

  const carregarVizinhos = async () => {
      try {
          // Chama a nova rota que criámos no backend
          const res = await axios.get(`${API_URL}/api/auth/vizinhos/${condominioSelecionado}`, {
              headers: { 'x-auth-token': localStorage.getItem('token') }
          });
          setListaVizinhos(res.data);
      } catch (err) { console.error("Erro ao carregar vizinhos"); }
  };
  
  // 3. CRIAR QUOTA (Agora escolhendo o inquilino)
  const criarPagamento = async (e) => {
      e.preventDefault();
      if (!novoInquilinoId) return alert("Escolha um inquilino.");

      try {
          await axios.post(`${API_URL}/api/pagamentos`, {
              inquilinoId: novoInquilinoId, // ID escolhido no Select
              condominioId: condominioSelecionado,
              valor: novoValor,
              descricao: novaDescricao
          }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
          
          alert("Aviso de pagamento enviado!");
          setShowCriar(false);
          setNovoInquilinoId(''); setNovoValor(''); setNovaDescricao('');
          carregarPagamentos();
      } catch (e) { alert("Erro ao criar quota."); }
  };

  const confirmarPagamento = async () => {
      try {
          await axios.put(`${API_URL}/api/pagamentos/${showConfirmar}/pagar`, {
              valorPago: valorRecebido
          }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
          setShowConfirmar(null);
          carregarPagamentos();
      } catch (e) { alert("Erro ao confirmar"); }
  };

  const downloadPDF = async (id, nomeDesc) => {
      try {
          const res = await axios.get(`${API_URL}/api/pagamentos/${id}/pdf`, {
              responseType: 'blob',
              headers: { 'x-auth-token': localStorage.getItem('token') }
          });
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Recibo-${nomeDesc}.pdf`);
          document.body.appendChild(link);
          link.click();
      } catch (e) { alert("Erro PDF"); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* HEADER E SELETOR DE PRÉDIO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
              <Euro /> Gestão de Quotas
          </h2>

          {user?.role === 'Admin' && (
            <div className="flex gap-4 items-center w-full md:w-auto">
                <div className="flex items-center gap-2 bg-white p-2 rounded shadow border border-brand-secondary flex-1">
                    <Building size={18} className="text-gray-400"/>
                    <select 
                        className="bg-transparent font-bold outline-none text-brand-primary cursor-pointer w-full"
                        value={condominioSelecionado || ''}
                        onChange={(e) => setCondominioSelecionado(e.target.value)}
                    >
                        {meusCondominios.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
                    </select>
                </div>

                <button onClick={() => setShowCriar(true)} className="bg-brand-secondary text-white px-4 py-2 rounded flex items-center gap-2 font-bold hover:bg-teal-600 shadow-md">
                    <Plus size={18}/> Nova Quota
                </button>
            </div>
          )}
      </div>

      {/* TABELA DE PAGAMENTOS */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
          <table className="w-full text-left">
              <thead className="bg-gray-50 border-b text-gray-500 text-sm uppercase">
                  <tr>
                      <th className="p-4">Descrição</th>
                      <th className="p-4">Inquilino</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Ações</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {pagamentos.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400">Sem pagamentos registados.</td></tr>}
                  
                  {pagamentos.map(pag => (
                      <tr key={pag._id} className="hover:bg-blue-50/30 transition">
                          <td className="p-4 font-bold text-gray-700">{pag.descricao}</td>
                          <td className="p-4 text-sm">
                              <div className="font-bold">{pag.inquilino?.nome}</div>
                              <div className="text-xs text-gray-400">{pag.inquilino?.fracao}</div>
                          </td>
                          <td className="p-4 text-brand-primary font-mono font-bold">{pag.valor} €</td>
                          <td className="p-4">
                              {pag.status === 'Pago' 
                                ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={14}/> PAGO</span>
                                : <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={14}/> PENDENTE</span>
                              }
                          </td>
                          <td className="p-4 text-right">
                              {pag.status === 'Pago' && (
                                  <button onClick={() => downloadPDF(pag._id, pag.descricao)} className="text-brand-primary hover:text-brand-secondary text-sm font-bold flex items-center gap-1 ml-auto">
                                      <Download size={16}/> Recibo
                                  </button>
                              )}
                              {pag.status === 'Pendente' && user.role === 'Admin' && (
                                  <button onClick={() => { setShowConfirmar(pag._id); setValorRecebido(pag.valor); }} className="bg-green-500 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-green-600 shadow-sm">
                                      Validar
                                  </button>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {/* MODAL: CRIAR NOVA QUOTA (Seleção de Inquilino) */}
      {showCriar && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
              <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-fade-in border-t-4 border-brand-secondary">
                  <h3 className="text-xl font-bold mb-4 text-brand-primary">Lançar Quota / Pagamento</h3>
                  <form onSubmit={criarPagamento}>
                      
                      {/* SELECT DE INQUILINOS */}
                      <label className="block text-sm font-bold text-gray-600 mb-1">Quem vai pagar?</label>
                      <div className="relative mb-4">
                          <User className="absolute top-3 left-3 text-gray-400" size={18}/>
                          <select 
                            required
                            className="w-full border p-2 pl-10 rounded focus:ring-2 focus:ring-brand-secondary outline-none bg-white"
                            value={novoInquilinoId}
                            onChange={e => setNovoInquilinoId(e.target.value)}
                          >
                              <option value="">Selecione um Inquilino...</option>
                              {listaVizinhos.map(vizinho => (
                                  <option key={vizinho._id} value={vizinho._id}>
                                      {vizinho.nome} — {vizinho.fracao} ({vizinho.role})
                                  </option>
                              ))}
                          </select>
                      </div>

                      <label className="block text-sm font-bold text-gray-600 mb-1">Descrição</label>
                      <input 
                        type="text" required placeholder="Ex: Quota Janeiro 2025"
                        className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-brand-secondary outline-none"
                        value={novaDescricao} onChange={e => setNovaDescricao(e.target.value)}
                      />

                      <label className="block text-sm font-bold text-gray-600 mb-1">Valor (€)</label>
                      <input 
                        type="number" required placeholder="0.00"
                        className="w-full border p-2 rounded mb-6 focus:ring-2 focus:ring-brand-secondary outline-none"
                        value={novoValor} onChange={e => setNovoValor(e.target.value)}
                      />

                      <div className="flex gap-3">
                          <button type="button" onClick={() => setShowCriar(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded font-bold">Cancelar</button>
                          <button type="submit" className="flex-1 py-2 bg-brand-secondary text-white font-bold rounded hover:bg-teal-600">Lançar Quota</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* MODAL: CONFIRMAR (Igual ao anterior) */}
      {showConfirmar && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
              <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm animate-fade-in border-t-4 border-green-500">
                  <h3 className="text-xl font-bold mb-2">Confirmar Recebimento</h3>
                  <p className="text-sm text-gray-500 mb-6">Confirme o valor recebido para gerar o recibo.</p>
                  <input type="number" className="w-full border p-3 rounded-lg mb-6 text-2xl font-mono text-center font-bold text-brand-primary" value={valorRecebido} onChange={e => setValorRecebido(e.target.value)} />
                  <div className="flex gap-3">
                      <button onClick={() => setShowConfirmar(null)} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 rounded-lg font-bold">Cancelar</button>
                      <button onClick={confirmarPagamento} className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">Confirmar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}