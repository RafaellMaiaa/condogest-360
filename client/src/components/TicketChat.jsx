import { useState } from 'react';
import axios from 'axios';
import { Send, MessageSquare } from 'lucide-react';

const API_URL = "http://localhost:5001";

export default function TicketChat({ ticketId, comentarios, user, aoAtualizar }) {
    const [novoTexto, setNovoTexto] = useState('');
    const [loading, setLoading] = useState(false);

    const enviarComentario = async (e) => {
        e.preventDefault();
        if (!novoTexto.trim()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/tickets/${ticketId}/comentarios`, 
                { texto: novoTexto },
                { headers: { 'x-auth-token': token } }
            );
            setNovoTexto('');
            aoAtualizar(res.data); // Atualiza a lista no pai
        } catch (error) { alert("Erro ao enviar"); }
        setLoading(false);
    };

    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                <MessageSquare size={16}/> Comentários ({comentarios.length})
            </h4>
            
            {/* ÁREA DE MENSAGENS */}
            <div className="bg-gray-50 rounded-lg p-4 h-48 overflow-y-auto mb-3 space-y-3 border">
                {comentarios.length === 0 && <p className="text-xs text-gray-400 text-center">Inicie a conversa...</p>}
                
                {comentarios.map((msg, i) => {
                    const souEu = msg.autor?._id === user._id;
                    return (
                        <div key={i} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-2 text-sm ${souEu ? 'bg-blue-100 text-blue-900' : 'bg-white border text-gray-800'}`}>
                                <p className="font-bold text-xs opacity-70 mb-1">{msg.autor?.nome} ({msg.autor?.role})</p>
                                <p>{msg.texto}</p>
                                <p className="text-[10px] text-right opacity-50 mt-1">{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* INPUT */}
            <form onSubmit={enviarComentario} className="flex gap-2">
                <input 
                    className="flex-1 border rounded px-3 py-2 text-sm outline-none focus:border-brand-secondary"
                    placeholder="Escreva uma resposta..."
                    value={novoTexto}
                    onChange={e => setNovoTexto(e.target.value)}
                    disabled={loading}
                />
                <button disabled={loading} className="bg-brand-secondary text-white p-2 rounded hover:bg-teal-600">
                    <Send size={18}/>
                </button>
            </form>
        </div>
    );
}