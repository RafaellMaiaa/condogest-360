import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; // IMPORTA O CONTEXTO
import { Camera, Paperclip, AlertCircle } from 'lucide-react';

const API_URL = "http://localhost:5001";

export default function MeusTickets() {
  const { user } = useContext(AuthContext); // PEGA O USER LOGADO
  const [tickets, setTickets] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('Média');
  const [fotos, setFotos] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    // Só carrega se tiver user e condominio
    if (user && user.condominio) {
      carregarTickets();
    }
  }, [user]);

  const carregarTickets = async () => {
    try {
      // USA O ID REAL DO PRÉDIO DO USER
      const res = await axios.get(`${API_URL}/api/tickets/condominio/${user.condominio._id || user.condominio}`);
      setTickets(res.data);
    } catch (error) { console.error("Erro", error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('prioridade', prioridade);
    formData.append('autorId', user._id); // ID REAL DO USER
    formData.append('condominioId', user.condominio._id || user.condominio); // ID REAL DO PRÉDIO
    
    fotos.forEach(f => formData.append('fotos', f));

    try {
      await axios.post(`${API_URL}/api/tickets`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
      <div className="bg-white p-6 rounded-xl shadow border-t-4 border-brand-secondary h-fit">
        <h2 className="text-xl font-bold mb-4 flex gap-2"><Paperclip/> Novo Pedido</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input className="w-full border p-2 rounded" placeholder="Assunto" value={titulo} onChange={e=>setTitulo(e.target.value)} required />
            <select className="w-full border p-2 rounded" value={prioridade} onChange={e=>setPrioridade(e.target.value)}>
                <option>Baixa</option><option>Média</option><option>Alta</option><option>Urgente</option>
            </select>
            <textarea className="w-full border p-2 rounded h-24" placeholder="Descrição" value={descricao} onChange={e=>setDescricao(e.target.value)} required />
            <input type="file" multiple onChange={handleFileChange} className="text-sm"/>
            <div className="flex gap-2">{previews.map((s,i)=><img key={i} src={s} className="w-12 h-12 object-cover rounded"/>)}</div>
            <button className="w-full bg-brand-secondary text-white py-2 rounded font-bold">Enviar</button>
        </form>
      </div>

      <div className="space-y-4">
         <h2 className="text-xl font-bold flex gap-2"><AlertCircle/> Tickets do Prédio</h2>
         {tickets.map(t => (
             <div key={t._id} className="bg-white p-4 rounded shadow border-l-4 border-brand-primary">
                 <div className="flex justify-between">
                     <span className="font-bold">{t.titulo}</span>
                     <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(t.prioridade)}`}>{t.prioridade}</span>
                 </div>
                 <p className="text-sm text-gray-600 mt-1">{t.descricao}</p>
                 <div className="flex gap-1 mt-2">
                    {t.fotos?.map((f,i)=><img key={i} src={`${API_URL}${f}`} className="w-10 h-10 rounded border"/>)}
                 </div>
                 <div className="text-xs text-gray-400 mt-2 flex justify-between">
                     <span>{t.autor?.nome || 'Vizinho'}</span>
                     <span>{t.status}</span>
                 </div>
             </div>
         ))}
      </div>
    </div>
  );
}