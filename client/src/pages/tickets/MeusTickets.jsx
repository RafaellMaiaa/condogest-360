import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Camera, Paperclip, AlertCircle } from 'lucide-react';
import TicketChat from '../../components/TicketChat'; // <--- IMPORTA O CHAT

const API_URL = "http://localhost:5001";

export default function MeusTickets() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  
  // Form States
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('Média');
  const [fotos, setFotos] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (user && user.condominio) {
      carregarTickets();
    }
  }, [user]);

  const carregarTickets = async () => {
    try {
      const idPredio = user.condominio._id || user.condominio;
      const res = await axios.get(`${API_URL}/api/tickets/condominio/${idPredio}`);
      setTickets(res.data);
    } catch (error) { console.error("Erro", error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('prioridade', prioridade);
    formData.append('autorId', user._id);
    formData.append('condominioId', user.condominio._id || user.condominio);
    
    fotos.forEach(f => formData.append('fotos', f));

    try {
      await axios.post(`${API_URL}/api/tickets`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': localStorage.getItem('token') }
      });
      alert('Ticket enviado!');
      setTitulo(''); setDescricao(''); setFotos([]); setPreviews([]);
      carregarTickets();
    } catch (error) { alert('Erro ao criar.'); }
  };

  const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      setFotos(files);
      setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const getPriorityColor = (p) => {
      if (p === 'Urgente') return 'bg-red-100 text-red-800 border-red-200';
      if (p === 'Alta') return 'bg-orange-100 text-orange-800 border-orange-200';
      if (p === 'Baixa') return 'bg-green-100 text-green-800 border-green-200';
      return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      
      {/* --- FORMULÁRIO DE NOVO TICKET --- */}
      <div className="bg-white p-6 rounded-xl shadow border-t-4 border-brand-secondary h-fit">
        <h2 className="text-xl font-bold mb-4 flex gap-2 text-brand-primary">
            <Paperclip className="text-brand-secondary"/> Novo Pedido
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-secondary outline-none" placeholder="Assunto (Ex: Luz fundida no 2º andar)" value={titulo} onChange={e=>setTitulo(e.target.value)} required />
            
            <select className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-brand-secondary outline-none" value={prioridade} onChange={e=>setPrioridade(e.target.value)}>
                <option value="Baixa">🟢 Baixa</option>
                <option value="Média">🔵 Média</option>
                <option value="Alta">🟠 Alta</option>
                <option value="Urgente">🔴 Urgente</option>
            </select>
            
            <textarea className="w-full border p-2 rounded h-24 focus:ring-2 focus:ring-brand-secondary outline-none" placeholder="Descrição detalhada do problema..." value={descricao} onChange={e=>setDescricao(e.target.value)} required />
            
            <div className="border-dashed border-2 border-gray-300 p-4 rounded text-center cursor-pointer hover:bg-gray-50 relative">
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Camera className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Adicionar Fotos</p>
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
                {previews.map((s,i)=><img key={i} src={s} className="w-12 h-12 object-cover rounded border"/>)}
            </div>
            
            <button className="w-full bg-brand-secondary text-white py-2 rounded font-bold hover:bg-teal-600 transition shadow-md">Enviar Pedido</button>
        </form>
      </div>

      {/* --- LISTA DE TICKETS --- */}
      <div className="space-y-4">
         <h2 className="text-xl font-bold flex gap-2 text-brand-primary">
            <AlertCircle className="text-brand-secondary"/> Tickets do Prédio
         </h2>
         
         {tickets.length === 0 && <p className="text-gray-500 text-center py-10 bg-white rounded shadow-sm">Nenhum ticket registado ainda.</p>}

         {tickets.map(ticket => (
             <div key={ticket._id} className="bg-white p-5 rounded-lg shadow border border-gray-100 hover:shadow-md transition">
                 
                 <div className="flex justify-between items-start mb-2">
                     <span className="font-bold text-lg text-gray-800">{ticket.titulo}</span>
                     <span className={`text-xs px-2 py-1 rounded-full border font-bold ${getPriorityColor(ticket.prioridade)}`}>{ticket.prioridade}</span>
                 </div>
                 
                 <p className="text-sm text-gray-600 mt-1 mb-3">{ticket.descricao}</p>
                 
                 {/* Fotos */}
                 {ticket.fotos?.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto">
                        {ticket.fotos.map((f,i)=><img key={i} src={`${API_URL}${f}`} className="w-16 h-16 rounded object-cover border cursor-pointer" onClick={()=>window.open(`${API_URL}${f}`)}/>)}
                    </div>
                 )}

                 <div className="text-xs text-gray-400 mt-2 flex justify-between border-t pt-2">
                     <span>👤 {ticket.autor?.nome || 'Vizinho'} ({ticket.autor?.andar || '?'})</span>
                     <span className="uppercase font-bold tracking-wider">{ticket.status}</span>
                 </div>

                 {/* --- AQUI ESTÁ O CHAT (DENTRO DO LOOP) --- */}
                 <TicketChat 
                    ticketId={ticket._id} 
                    comentarios={ticket.comentarios || []} 
                    user={user}
                    aoAtualizar={(novosComentarios) => {
                        // Atualiza apenas este ticket na lista sem recarregar tudo
                        setTickets(tickets.map(t => t._id === ticket._id ? {...t, comentarios: novosComentarios} : t));
                    }}
                 />
                 
             </div>
         ))}
      </div>
    </div>
  );
}