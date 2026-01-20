import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Para ler o ID do URL
import { Archive, Save } from 'lucide-react';

const API_URL = "http://localhost:5001";

export default function AdminTickets() {
  const { condominioId } = useParams(); // Pega o ID que vem do Dashboard
  const [activeTab, setActiveTab] = useState('ativos');
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    carregarTickets();
  }, [activeTab, condominioId]);

  const carregarTickets = () => {
    if(!condominioId) return;
    const endpoint = activeTab === 'ativos' 
      ? `/api/tickets/condominio/${condominioId}`
      : `/api/tickets/arquivados/${condominioId}`;

    axios.get(API_URL + endpoint).then(res => setTickets(res.data));
  };

  // Função para mudar Status/Prioridade instantaneamente
  const atualizarTicket = async (id, campo, valor) => {
    try {
      await axios.put(`${API_URL}/api/tickets/${id}`, { [campo]: valor });
      // Atualiza visualmente sem recarregar tudo
      setTickets(tickets.map(t => t._id === id ? { ...t, [campo]: valor } : t));
    } catch (err) { alert("Erro ao atualizar"); }
  };

  const arquivarTicket = async (id) => {
    if(!window.confirm("Arquivar este ticket?")) return;
    await axios.put(`${API_URL}/api/tickets/arquivar/${id}`);
    carregarTickets();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-brand-primary mb-6">Gestão de Ocorrências</h2>

      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setActiveTab('ativos')} className={`px-4 py-2 font-bold ${activeTab === 'ativos' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-gray-500'}`}>Abertos</button>
        <button onClick={() => setActiveTab('arquivados')} className={`px-4 py-2 font-bold ${activeTab === 'arquivados' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-gray-500'}`}>Arquivo</button>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 && <p>Nenhum ticket encontrado.</p>}
        
        {tickets.map(ticket => (
          <div key={ticket._id} className="bg-white border p-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between gap-4">
            
            {/* Info Principal */}
            <div className="flex-1">
              <h3 className="font-bold text-lg">{ticket.titulo}</h3>
              <p className="text-sm text-gray-600 mb-2">{ticket.descricao}</p>
              <div className="flex gap-2">
                 {ticket.fotos?.map((f, i) => <img key={i} src={`${API_URL}${f}`} className="w-12 h-12 rounded object-cover border" />)}
              </div>
              <p className="text-xs text-gray-400 mt-2">Autor: {ticket.autor?.nome} | Data: {new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Controles do Admin */}
            {activeTab === 'ativos' && (
              <div className="flex flex-col gap-2 min-w-[200px]">
                
                {/* Selector de Status */}
                <select 
                   className="border p-2 rounded text-sm bg-gray-50"
                   value={ticket.status}
                   onChange={(e) => atualizarTicket(ticket._id, 'status', e.target.value)}
                >
                  <option value="Aberto">🟢 Aberto</option>
                  <option value="Em Progresso">🟡 Em Progresso</option>
                  <option value="Resolvido">🔵 Resolvido</option>
                </select>

                {/* Selector de Prioridade */}
                <select 
                   className="border p-2 rounded text-sm bg-gray-50"
                   value={ticket.prioridade || 'Média'}
                   onChange={(e) => atualizarTicket(ticket._id, 'prioridade', e.target.value)}
                >
                  <option value="Baixa">Prioridade: Baixa</option>
                  <option value="Média">Prioridade: Média</option>
                  <option value="Alta">Prioridade: Alta</option>
                  <option value="Urgente">Prioridade: Urgente</option>
                </select>

                <button onClick={() => arquivarTicket(ticket._id)} className="text-red-500 text-sm hover:underline flex items-center justify-end mt-2 gap-1">
                  <Archive size={14}/> Arquivar Ticket
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}