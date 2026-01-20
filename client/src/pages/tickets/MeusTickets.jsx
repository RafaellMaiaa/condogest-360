import { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, Paperclip } from 'lucide-react';

// URL DO BACKEND
const API_URL = "http://localhost:5001";
// IDs FICTÍCIOS PARA TESTE (Depois vêm do Login)
const USER_ID = "695ee43ce393bdd00aae77ce"; // Substitui por um ID real do teu MongoDB se tiveres
const CONDOMINIO_ID = "695ee26c7024f0eda27c796f"; // Substitui por um ID real

export default function MeusTickets() {
  const [tickets, setTickets] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotos, setFotos] = useState([]);   
  const [previews, setPreviews] = useState([]);

  // 1. Carregar Tickets
  const carregarTickets = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tickets/condominio/${CONDOMINIO_ID}`);
      setTickets(res.data);
    } catch (error) {
      console.error("Erro ao buscar tickets", error);
    }
  };

  useEffect(() => { carregarTickets(); }, []);

  // 2. Lidar com Ficheiros
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  // 3. Enviar Ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('autorId', USER_ID);
    formData.append('condominioId', CONDOMINIO_ID);
    
    fotos.forEach(foto => formData.append('fotos', foto));

    try {
      await axios.post(`${API_URL}/api/tickets`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Ticket criado!');
      setTitulo(''); setDescricao(''); setFotos([]); setPreviews([]);
      carregarTickets();
    } catch (error) {
      alert('Erro ao criar ticket.');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* FORMULÁRIO */}
      <div className="bg-white p-6 rounded-xl shadow-md h-fit border-t-4 border-brand-secondary">
        <h2 className="text-xl font-bold text-brand-primary mb-4 flex items-center gap-2">
          <Paperclip size={20}/> Reportar Problema
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Assunto" required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-secondary outline-none"
            value={titulo} onChange={e => setTitulo(e.target.value)}
          />
          <textarea 
            placeholder="Descreva a avaria..." required
            className="w-full border p-2 rounded h-32 focus:ring-2 focus:ring-brand-secondary outline-none"
            value={descricao} onChange={e => setDescricao(e.target.value)}
          />
          
          {/* Upload Visual */}
          <div className="border-dashed border-2 border-gray-300 p-4 rounded text-center cursor-pointer hover:bg-gray-50 relative">
            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Camera className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Clica para adicionar fotos</p>
          </div>

          {/* Previews */}
          <div className="flex gap-2 overflow-x-auto">
            {previews.map((src, i) => <img key={i} src={src} className="h-16 w-16 object-cover rounded border" />)}
          </div>

          <button type="submit" className="w-full bg-brand-secondary text-white font-bold py-2 rounded hover:bg-teal-600 transition">
            Enviar Pedido
          </button>
        </form>
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-brand-primary">Ocorrências no Prédio</h2>
        {tickets.length === 0 && <p className="text-gray-500">Tudo calmo por aqui.</p>}
        {tickets.map(ticket => (
          <div key={ticket._id} className="bg-white p-4 rounded-lg shadow border-l-4 border-brand-primary">
            <div className="flex justify-between">
              <h3 className="font-bold text-lg">{ticket.titulo}</h3>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded h-fit">{ticket.status}</span>
            </div>
            <p className="text-gray-600 text-sm mt-1">{ticket.descricao}</p>
            
            {/* Fotos do Ticket */}
            <div className="flex gap-2 mt-3">
              {ticket.fotos?.map((foto, i) => (
                <img key={i} src={`${API_URL}${foto}`} className="w-12 h-12 object-cover rounded cursor-pointer border" onClick={()=>window.open(`${API_URL}${foto}`)} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Por: {ticket.autor?.nome || 'Vizinho'} - {new Date(ticket.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}