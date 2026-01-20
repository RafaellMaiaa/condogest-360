import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, MapPin, Users, Check, X, Trash2, Plus, Building } from 'lucide-react';

const API_URL = "http://localhost:5001";

export default function Comunicados() {
  const { user } = useContext(AuthContext);
  
  // Dados
  const [reunioes, setReunioes] = useState([]);
  const [meusCondominios, setMeusCondominios] = useState([]); // Lista para o Admin escolher
  const [condominioSelecionado, setCondominioSelecionado] = useState(null); // O ID do prédio atual

  // Formulário
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [local, setLocal] = useState('Hall de Entrada');
  const [descricao, setDescricao] = useState('');

  // 1. CARREGAR CONTEXTO (Qual prédio estamos a ver?)
  useEffect(() => {
    if (!user) return;

    const carregarDadosIniciais = async () => {
        const token = localStorage.getItem('token');
        
        if (user.role === 'Admin') {
            // Se for Admin, busca a lista de prédios para preencher o "Select"
            try {
                const res = await axios.get(`${API_URL}/api/condominios`, { headers: { 'x-auth-token': token } });
                setMeusCondominios(res.data);
                // Seleciona o primeiro da lista automaticamente se houver
                if (res.data.length > 0) {
                    setCondominioSelecionado(res.data[0]._id);
                }
            } catch (err) { console.error("Erro ao buscar prédios do admin"); }
        } else {
            // Se for Inquilino, o prédio é fixo (o dele)
            const idPredio = user.condominio._id || user.condominio;
            setCondominioSelecionado(idPredio);
        }
    };

    carregarDadosIniciais();
  }, [user]);

  // 2. CARREGAR REUNIÕES (Sempre que mudamos de prédio)
  useEffect(() => {
    if (condominioSelecionado) {
        carregarReunioes();
    }
  }, [condominioSelecionado]);

  const carregarReunioes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reunioes/${condominioSelecionado}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setReunioes(res.data);
    } catch (error) { console.error("Erro ao carregar reuniões"); }
  };

  const criarReuniao = async (e) => {
    e.preventDefault();
    if (!condominioSelecionado) return alert("Erro: Nenhum condomínio selecionado.");

    const dataCompleta = new Date(`${data}T${hora}`);
    
    try {
      await axios.post(`${API_URL}/api/reunioes`, {
        titulo, descricao, local, data: dataCompleta,
        condominioId: condominioSelecionado // <--- USA O PRÉDIO SELECIONADO NO MENU
      }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
      
      alert("Reunião Agendada!");
      setShowForm(false);
      setTitulo(''); setData(''); setHora(''); setDescricao('');
      carregarReunioes();
    } catch (error) { alert("Erro ao criar reunião"); }
  };

  const responderRSVP = async (id, resposta) => {
    try {
      const res = await axios.put(`${API_URL}/api/reunioes/${id}/rsvp`, 
        { resposta }, 
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setReunioes(reunioes.map(r => r._id === id ? res.data : r));
    } catch (error) { alert("Erro ao responder"); }
  };

  const apagarReuniao = async (id) => {
    if(!confirm("Cancelar esta reunião?")) return;
    try {
        await axios.delete(`${API_URL}/api/reunioes/${id}`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setReunioes(reunioes.filter(r => r._id !== id));
    } catch (err) { alert("Erro ao apagar"); }
  };

  const getMinhaResposta = (reuniao) => {
    if (reuniao.confirmados.some(u => u._id === user._id || u === user._id)) return 'vou';
    if (reuniao.recusados.some(u => u._id === user._id || u === user._id)) return 'nao';
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* CABEÇALHO E SELETOR DE PRÉDIO (SÓ PARA ADMIN) */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
                <Calendar className="text-brand-secondary"/> Quadro de Reuniões
            </h2>
            
            {/* SELETOR DE PRÉDIO - ADMIN */}
            {user?.role === 'Admin' && (
                <div className="flex items-center gap-2 bg-white p-2 rounded shadow border border-brand-secondary">
                    <Building size={18} className="text-gray-400"/>
                    <select 
                        className="bg-transparent font-bold outline-none text-brand-primary cursor-pointer min-w-[200px]"
                        value={condominioSelecionado || ''}
                        onChange={(e) => setCondominioSelecionado(e.target.value)}
                    >
                        {meusCondominios.map(c => (
                            <option key={c._id} value={c._id}>{c.nome}</option>
                        ))}
                        {meusCondominios.length === 0 && <option>Sem Condomínios</option>}
                    </select>
                </div>
            )}

            {user?.role === 'Admin' && (
                <button onClick={() => setShowForm(!showForm)} className="bg-brand-secondary text-white px-4 py-2 rounded flex items-center gap-2 font-bold hover:bg-teal-600 transition">
                    <Plus size={18}/> Nova Reunião
                </button>
            )}
        </div>
        {user?.role === 'Admin' && <p className="text-xs text-gray-500 mt-2 text-right">A ver reuniões de: {meusCondominios.find(c=>c._id === condominioSelecionado)?.nome}</p>}
      </div>

      {/* FORMULÁRIO */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border-t-4 border-brand-secondary animate-fade-in">
            <h3 className="font-bold mb-4 text-brand-primary">Agendar Reunião para: <span className="text-black underline">{meusCondominios.find(c=>c._id === condominioSelecionado)?.nome}</span></h3>
            <form onSubmit={criarReuniao} className="space-y-4">
                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-secondary outline-none" placeholder="Assunto (Ex: Assembleia Geral)" value={titulo} onChange={e=>setTitulo(e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                    <input type="date" className="border p-2 rounded outline-none" value={data} onChange={e=>setData(e.target.value)} required />
                    <input type="time" className="border p-2 rounded outline-none" value={hora} onChange={e=>setHora(e.target.value)} required />
                </div>
                <input className="w-full border p-2 rounded outline-none" placeholder="Local (Ex: Hall de Entrada)" value={local} onChange={e=>setLocal(e.target.value)} />
                <textarea className="w-full border p-2 rounded h-24 outline-none" placeholder="Descrição / Ordem de trabalhos" value={descricao} onChange={e=>setDescricao(e.target.value)} />
                <button className="bg-brand-primary text-white px-6 py-2 rounded font-bold w-full hover:bg-brand-primaryDark transition">Publicar Convocatória</button>
            </form>
        </div>
      )}

      {/* LISTA DE REUNIÕES */}
      <div className="space-y-6">
        {reunioes.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">Não há reuniões agendadas para este prédio.</p>
                {user?.role === 'Admin' && <p className="text-sm text-brand-secondary mt-2 cursor-pointer" onClick={()=>setShowForm(true)}>Agendar a primeira agora</p>}
            </div>
        )}
        
        {reunioes.map(reuniao => {
            const minhaResposta = getMinhaResposta(reuniao);
            
            return (
                <div key={reuniao._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-brand-primary">{reuniao.titulo}</h3>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded"><Calendar size={14}/> {new Date(reuniao.data).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded"><Users size={14}/> {new Date(reuniao.data).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"><MapPin size={14}/> {reuniao.local}</span>
                                </div>
                            </div>
                            {user?.role === 'Admin' && (
                                <button onClick={() => apagarReuniao(reuniao._id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                            )}
                        </div>

                        <p className="mt-4 text-gray-700 bg-gray-50 p-4 rounded text-sm whitespace-pre-line border-l-2 border-gray-200">{reuniao.descricao}</p>

                        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t pt-4">
                            <div className="flex gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => responderRSVP(reuniao._id, 'vou')}
                                    className={`flex-1 md:flex-none px-4 py-2 rounded-full flex justify-center items-center gap-2 font-bold transition ${minhaResposta === 'vou' ? 'bg-green-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-green-100'}`}
                                >
                                    <Check size={18}/> Vou
                                </button>
                                <button 
                                    onClick={() => responderRSVP(reuniao._id, 'nao')}
                                    className={`flex-1 md:flex-none px-4 py-2 rounded-full flex justify-center items-center gap-2 font-bold transition ${minhaResposta === 'nao' ? 'bg-red-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-red-100'}`}
                                >
                                    <X size={18}/> Não Vou
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-bold bg-brand-secondary text-white px-2 py-0.5 rounded-full text-xs">{reuniao.confirmados.length}</span>
                                <span>vizinhos confirmados</span>
                                
                                {reuniao.confirmados.length > 0 && (
                                    <div className="group relative ml-2">
                                        <span className="text-brand-secondary cursor-help underline text-xs font-bold">Ver Lista</span>
                                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white text-gray-800 text-xs p-3 rounded hidden group-hover:block z-10 shadow-xl border border-gray-200">
                                            <p className="font-bold mb-2 text-gray-400 border-b pb-1">PRESENÇAS:</p>
                                            {reuniao.confirmados.map(u => (
                                                <div key={u._id} className="mb-1">{u.nome} <span className="text-gray-400">({u.fracao})</span></div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}