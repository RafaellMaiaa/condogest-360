import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // <--- Importar Contexto para o Chat
import { Archive, AlertCircle } from 'lucide-react';
import TicketChat from '../../components/TicketChat'; // <--- Importado apenas uma vez!

const API_URL = "http://localhost:5001";

export default function AdminTickets() {
  const { condominioId } = useParams();
  const { user } = useContext(AuthContext); // Precisamos do user para o Chat saber quem responde
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

  const atualizarTicket = async (id, campo, valor) => {
    try {
      await axios.put(`${API_URL}/api/tickets/${id}`, { [campo]: valor });
      setTickets(tickets.map(t => t._id === id ? { ...t, [campo]: valor } : t));
    } catch (err) { alert("Erro ao atualizar"); }
  };

  const arquivarTicket = async (id) => {
    if(!window.confirm("Arquivar este ticket?")) return;
    await axios.put(`${API_URL}/api/tickets/arquivar/${id}`);
    carregarTickets();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-brand-primary mb-6 flex items-center gap-2">
        <AlertCircle /> Gestão de Ocorrências
      </h2>

      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setActiveTab('ativos')} className={`px-4 py-2 font-bold ${activeTab === 'ativos' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-gray-500'}`}>Abertos</button>
        <button onClick={() => setActiveTab('arquivados')} className={`px-4 py-2 font-bold ${activeTab === 'arquivados' ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-gray-500'}`}>Arquivo</button>
      </div>

      <div className="space-y-6">
        {tickets.length === 0 && <p className="text-gray-500 italic">Nenhum ticket encontrado.</p>}
        
        {tickets.map(ticket => (
          <div key={ticket._id} className="bg-white border p-6 rounded-lg shadow-sm flex flex-col gap-4">
            
            <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Info Principal */}
                <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{ticket.titulo}</h3>
                <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{ticket.descricao}</p>
                
                {/* Galeria de Fotos */}
                {ticket.fotos?.length > 0 && (
                    <div className="flex gap-2 mb-3">
                        {ticket.fotos.map((f, i) => <img key={i} src={`${API_URL}${f}`} className="w-16 h-16 rounded object-cover border cursor-pointer hover:opacity-80" onClick={()=>window.open(`${API_URL}${f}`)} />)}
                    </div>
                )}
                
                <p className="text-xs text-gray-400">
                    Autor: <span className="font-bold">{ticket.autor?.nome}</span> ({ticket.autor?.andar || '?'}) | {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
                </div>

                {/* Controles do Admin */}
                {activeTab === 'ativos' && (
                <div className="flex flex-col gap-3 min-w-[220px] bg-gray-50 p-3 rounded h-fit">
                    
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Estado</label>
                        <select 
                        className="w-full border p-2 rounded text-sm bg-white mt-1"
                        value={ticket.status}
                        onChange={(e) => atualizarTicket(ticket._id, 'status', e.target.value)}
                        >
                        <option value="Aberto">🟢 Aberto</option>
                        <option value="Em Progresso">🟡 Em Progresso</option>
                        <option value="Resolvido">🔵 Resolvido</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Prioridade</label>
                        <select 
                        className="w-full border p-2 rounded text-sm bg-white mt-1"
                        value={ticket.prioridade || 'Média'}
                        onChange={(e) => atualizarTicket(ticket._id, 'prioridade', e.target.value)}
                        >
                        <option value="Baixa">🟢 Baixa</option>
                        <option value="Média">🔵 Média</option>
                        <option value="Alta">🟠 Alta</option>
                        <option value="Urgente">🔴 Urgente</option>
                        </select>
                    </div>

                    <button onClick={() => arquivarTicket(ticket._id)} className="text-red-400 text-xs hover:text-red-600 flex items-center justify-end gap-1 mt-1">
                        <Archive size={14}/> Arquivar
                    </button>
                </div>
                )}
            </div>

            {/* --- ÁREA DE CHAT --- */}
            <TicketChat 
                ticketId={ticket._id} 
                comentarios={ticket.comentarios || []} 
                user={user}
                aoAtualizar={(novosComentarios) => {
                    setTickets(tickets.map(t => t._id === ticket._id ? {...t, comentarios: novosComentarios} : t));
                }}
            />

          </div>
        ))}
      </div>
    </div>
  );
}