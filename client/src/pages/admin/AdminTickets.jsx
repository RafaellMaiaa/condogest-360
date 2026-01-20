import { useState, useEffect } from 'react';
import axios from 'axios';
import { Archive, RotateCcw } from 'lucide-react';

const API_URL = "http://localhost:5001";
const CONDOMINIO_ID = "65f2d6e4a2b1c3d4e5f67899"; // O mesmo ID de teste

export default function AdminTickets() {
  const [tab, setTab] = useState('ativos'); // ativos | arquivados
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const route = tab === 'ativos' ? `/api/tickets/condominio/${CONDOMINIO_ID}` : `/api/tickets/arquivados/${CONDOMINIO_ID}`;
    axios.get(API_URL + route).then(res => setTickets(res.data));
  }, [tab]);

  const arquivar = async (id) => {
    if(!window.confirm("Tem a certeza?")) return;
    await axios.put(`${API_URL}/api/tickets/arquivar/${id}`);
    setTickets(tickets.filter(t => t._id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brand-primary">Gestão de Tickets</h2>
        <div className="flex bg-white rounded-lg shadow overflow-hidden">
          <button onClick={() => setTab('ativos')} className={`px-4 py-2 ${tab === 'ativos' ? 'bg-brand-primary text-white' : 'text-gray-600'}`}>Ativos</button>
          <button onClick={() => setTab('arquivados')} className={`px-4 py-2 ${tab === 'arquivados' ? 'bg-red-500 text-white' : 'text-gray-600'}`}>Arquivo</button>
        </div>
      </div>

      <div className="grid gap-4">
        {tickets.map(ticket => (
          <div key={ticket._id} className="bg-white p-4 rounded shadow flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{ticket.titulo} <span className="text-xs font-normal text-gray-400">({ticket.status})</span></h3>
              <p className="text-gray-600">{ticket.descricao}</p>
              <div className="flex gap-2 mt-2">
                {ticket.fotos?.map((f, i) => <img key={i} src={`${API_URL}${f}`} className="w-10 h-10 rounded object-cover" />)}
              </div>
            </div>
            
            {tab === 'ativos' && (
              <button onClick={() => arquivar(ticket._id)} className="text-red-500 hover:bg-red-50 p-2 rounded flex items-center gap-1 text-sm font-bold border border-red-100">
                <Archive size={16} /> Arquivar
              </button>
            )}
            {tab === 'arquivados' && (
              <span className="text-xs text-red-400 italic">Arquivado</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}