import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Building, Plus, Trash2, Copy, ArrowRight, TrendingUp, AlertTriangle, X, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const API_URL = "http://localhost:5001";

// Cores para os gráficos
const COLOR_PAID = '#48bb78'; // Verde
const COLOR_PENDING = '#ecc94b'; // Amarelo
const COLOR_BAR = '#4299e1'; // Azul

export default function DashboardAdmin() {
    const { user } = useContext(AuthContext);
    const [condominios, setCondominios] = useState([]);
    
    // Estado para Analytics
    const [stats, setStats] = useState(null); // Dados estatísticos
    const [condominioAtivo, setCondominioAtivo] = useState(null); // ID do prédio selecionado para ver gráficos
    
    // Estado para Formulário
    const [formVisivel, setFormVisivel] = useState(false);
    const [novoNome, setNovoNome] = useState('');
    const [novaMorada, setNovaMorada] = useState('');

    useEffect(() => {
        carregarCondominios();
    }, []);

    // 1. Carregar lista de prédios
    const carregarCondominios = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_URL}/api/condominios`, { headers: { 'x-auth-token': token } });
            setCondominios(res.data);
            // Se houver prédios e ainda não tiver nenhum selecionado, carrega stats do primeiro
            if (res.data.length > 0 && !condominioAtivo) {
                carregarStats(res.data[0]._id);
            }
        } catch (error) { console.error(error); }
    };

    // 2. Carregar Estatísticas de um prédio específico
    const carregarStats = async (id) => {
        setCondominioAtivo(id);
        const token = localStorage.getItem('token');
        try {
            // Chama a rota nova do backend
            const res = await axios.get(`${API_URL}/api/stats/${id}`, { headers: { 'x-auth-token': token } });
            setStats(res.data);
        } catch (error) { console.error(error); setStats(null); }
    };

    // 3. Criar Prédio (Mantém a funcionalidade antiga)
    const criarCondominio = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/api/condominios`, 
                { nome: novoNome, morada: novaMorada },
                { headers: { 'x-auth-token': token } }
            );
            setNovoNome(''); setNovaMorada(''); setFormVisivel(false);
            carregarCondominios();
            alert("Prédio criado com sucesso!");
        } catch (error) { alert("Erro ao criar."); }
    };

    // 4. Apagar Prédio
    const apagarCondominio = async (id) => {
        if(!confirm("ATENÇÃO: Apagar este prédio apagará todos os dados associados (tickets, etc). Continuar?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/api/condominios/${id}`, { headers: { 'x-auth-token': token } });
            const novaLista = condominios.filter(c => c._id !== id);
            setCondominios(novaLista);
            // Se apagámos o ativo, seleciona outro ou limpa stats
            if (id === condominioAtivo) {
                if (novaLista.length > 0) carregarStats(novaLista[0]._id);
                else setStats(null);
            }
        } catch (error) { alert("Erro ao apagar"); }
    };

    // Preparar dados para os gráficos do Recharts
    const dadosFinanceiros = stats ? [
        { name: 'Pago', valor: stats.financeiro.arrecadado },
        { name: 'Pendente', valor: stats.financeiro.pendente }
    ] : [];

    const dadosTickets = stats ? [
        { name: 'Abertos', valor: stats.tickets.abertos },
        { name: 'Resolvidos', valor: stats.tickets.resolvidos }
    ] : [];

    // Nome do prédio ativo para mostrar no título
    const ativoNome = condominios.find(c => c._id === condominioAtivo)?.nome || 'Prédio';

    return (
        <div className="max-w-7xl mx-auto pb-20">
            
            {/* HEADER E BOAS-VINDAS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-brand-primary">Painel de Controlo</h1>
                    <p className="text-gray-600">Bem-vindo, {user?.nome}. Aqui está o resumo da sua gestão.</p>
                </div>
                {!formVisivel && (
                    <button onClick={() => setFormVisivel(true)} className="bg-brand-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-teal-600 shadow-sm transition">
                        <Plus size={20} /> Novo Prédio
                    </button>
                )}
            </div>

            {/* FORMULÁRIO DE CRIAÇÃO (TOGGLE) */}
            {formVisivel && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-l-4 border-brand-secondary animate-fade-in relative">
                    <button onClick={() => setFormVisivel(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Building size={20} className="text-brand-secondary"/> Registar Novo Prédio</h3>
                    <form onSubmit={criarCondominio} className="flex gap-4 flex-col md:flex-row">
                        <input className="border p-3 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-brand-secondary" placeholder="Nome (ex: Edifício Horizonte)" value={novoNome} onChange={e=>setNovoNome(e.target.value)} required />
                        <input className="border p-3 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-brand-secondary" placeholder="Morada Completa" value={novaMorada} onChange={e=>setNovaMorada(e.target.value)} required />
                        <button type="submit" className="bg-brand-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-primaryDark transition">Gravar</button>
                    </form>
                </div>
            )}

            {condominios.length === 0 && !formVisivel && (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border-dashed border-2 border-gray-300">
                    <Building size={48} className="mx-auto text-gray-300 mb-4"/>
                    <p className="text-gray-500 text-lg mb-4">Ainda não gere nenhum condomínio.</p>
                    <button onClick={() => setFormVisivel(true)} className="text-brand-secondary font-bold hover:underline">Crie o primeiro agora</button>
                </div>
            )}

            {condominios.length > 0 && (
                <>
                    {/* 1. SELETOR DE PRÉDIO (TABS) */}
                    <div className="mb-2">
                        <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Analisar Prédio:</h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {condominios.map(c => (
                                <button 
                                    key={c._id}
                                    onClick={() => carregarStats(c._id)}
                                    className={`px-5 py-2 rounded-full whitespace-nowrap font-bold text-sm transition border ${condominioAtivo === c._id ? 'bg-brand-primary text-white border-brand-primary shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
                                >
                                    {c.nome}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. ÁREA DE GRÁFICOS (Dashboard) */}
                    {stats ? (
                        <div className="grid md:grid-cols-2 gap-6 mb-12 animate-fade-in">
                            
                            {/* CARTÃO FINANCEIRO */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-800">
                                    <Wallet className="text-green-500"/> Situação Financeira: <span className="text-brand-primary">{ativoNome}</span>
                                </h3>
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    {/* Gráfico Tarte */}
                                    <div className="w-48 h-48 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={dadosFinanceiros} dataKey="valor" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                                                    <Cell fill={COLOR_PAID} />
                                                    <Cell fill={COLOR_PENDING} />
                                                </Pie>
                                                <Tooltip formatter={(value) => `${value.toFixed(2)}€`} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-gray-400 font-bold text-sm">Total</span>
                                        </div>
                                    </div>
                                    
                                    {/* Resumo Texto */}
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                            <p className="text-sm text-green-700 font-bold mb-1 flex items-center gap-1"><TrendingUp size={14}/> Total Arrecadado</p>
                                            <p className="text-3xl font-bold text-green-600">{stats.financeiro.arrecadado.toFixed(2)} €</p>
                                        </div>
                                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                            <p className="text-sm text-yellow-700 font-bold mb-1">Pendente de Pagamento</p>
                                            <p className="text-2xl font-bold text-yellow-600">{stats.financeiro.pendente.toFixed(2)} €</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CARTÃO TICKETS */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-800">
                                    <AlertTriangle className="text-blue-500"/> Ocorrências e Manutenção
                                </h3>
                                
                                <div className="flex-1 flex items-center mb-4">
                                    {stats.tickets.total === 0 ? (
                                        <p className="text-gray-400 text-center w-full italic">Sem tickets registados neste prédio.</p>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={dadosTickets} layout="vertical" margin={{left: 0, right: 20}}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee"/>
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fontWeight: 'bold', fill: '#666'}} axisLine={false} tickLine={false}/>
                                                <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => [`${value} Tickets`]} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                                                <Bar dataKey="valor" fill={COLOR_BAR} barSize={24} radius={[0, 6, 6, 0]}>
                                                    {dadosTickets.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.name === 'Abertos' ? '#f56565' : COLOR_BAR} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                                
                                {/* Resumo Rápido */}
                                <div className="flex gap-4 text-center mb-4 bg-gray-50 p-3 rounded-xl">
                                    <div className="flex-1">
                                        <p className="text-2xl font-bold text-red-500">{stats.tickets.abertos}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Abertos</p>
                                    </div>
                                    <div className="border-r border-gray-200"></div>
                                    <div className="flex-1">
                                        <p className="text-2xl font-bold text-blue-500">{stats.tickets.resolvidos}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Resolvidos</p>
                                    </div>
                                    <div className="border-r border-gray-200"></div>
                                    <div className="flex-1">
                                        <p className="text-2xl font-bold text-gray-700">{stats.tickets.total}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Total</p>
                                    </div>
                                </div>

                                <div className="text-center mt-auto">
                                    <Link to={`/admin/tickets/${condominioAtivo}`} className="w-full bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-100 transition flex justify-center items-center gap-2">
                                        Gerir Todos os Tickets <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-64 mb-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                        </div>
                    )}

                    {/* 3. LISTA RÁPIDA DE PRÉDIOS (Rodapé) */}
                    <div className="border-t pt-8">
                        <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Acesso Rápido e Códigos</h3>
                        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {condominios.map(condo => (
                                <div key={condo._id} className={`bg-white p-4 rounded-xl shadow-sm border transition group relative ${condominioAtivo === condo._id ? 'border-brand-secondary ring-1 ring-brand-secondary' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <button onClick={() => apagarCondominio(condo._id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                                    
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-blue-50 p-2 rounded-lg text-brand-primary"><Building size={20}/></div>
                                        <h3 className="font-bold text-gray-800 truncate">{condo.nome}</h3>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-2 rounded-lg flex justify-between items-center mb-3">
                                        <span className="font-mono font-bold text-sm text-gray-600">{condo.codigoAcesso}</span>
                                        <button onClick={() => navigator.clipboard.writeText(condo.codigoAcesso)} className="text-gray-400 hover:text-brand-secondary" title="Copiar Código"><Copy size={14}/></button>
                                    </div>

                                    <button onClick={() => carregarStats(condo._id)} className="text-sm text-brand-primary font-bold hover:underline flex items-center gap-1">
                                        Ver no Painel <ArrowRight size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}