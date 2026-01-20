import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Building, Plus, Trash2, Copy, ArrowRight } from 'lucide-react';

const API_URL = "http://localhost:5001";

export default function DashboardAdmin() {
    const { user } = useContext(AuthContext);
    const [condominios, setCondominios] = useState([]);
    const [formVisivel, setFormVisivel] = useState(false);
    
    const [novoNome, setNovoNome] = useState('');
    const [novaMorada, setNovaMorada] = useState('');

    useEffect(() => { carregarCondominios(); }, []);

    const carregarCondominios = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_URL}/api/condominios`, {
                headers: { 'x-auth-token': token }
            });
            setCondominios(res.data);
        } catch (error) { console.error("Erro a carregar"); }
    };

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
            alert("Prédio criado com código de acesso!");
        } catch (error) { alert("Erro ao criar."); }
    };

    const apagarCondominio = async (id) => {
        if(!confirm("Apagar este prédio?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/api/condominios/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setCondominios(condominios.filter(c => c._id !== id));
        } catch (error) { alert("Erro ao apagar"); }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-brand-primary">Olá, {user?.nome}</h1>
                <button onClick={() => setFormVisivel(!formVisivel)} className="bg-brand-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold">
                    <Plus size={20} /> Novo Condomínio
                </button>
            </div>

            {formVisivel && (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-brand-secondary">
                    <form onSubmit={criarCondominio} className="flex gap-4 flex-col md:flex-row">
                        <input className="border p-2 rounded flex-1" placeholder="Nome do Prédio" value={novoNome} onChange={e=>setNovoNome(e.target.value)} required />
                        <input className="border p-2 rounded flex-1" placeholder="Morada" value={novaMorada} onChange={e=>setNovaMorada(e.target.value)} required />
                        <button type="submit" className="bg-brand-primary text-white px-6 py-2 rounded font-bold">Criar</button>
                    </form>
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {condominios.map(condo => (
                    <div key={condo._id} className="bg-white rounded-xl shadow p-6 border-t-4 border-brand-primary relative">
                         <div className="absolute top-4 right-4 text-red-300 cursor-pointer hover:text-red-600" onClick={() => apagarCondominio(condo._id)}><Trash2 size={18} /></div>
                        <h3 className="text-xl font-bold">{condo.nome}</h3>
                        <p className="text-sm text-gray-500 mb-4">{condo.morada}</p>
                        <div className="bg-blue-50 p-3 rounded mb-4 flex justify-between items-center">
                            <span className="font-mono font-bold text-lg">{condo.codigoAcesso}</span>
                            <Copy size={16} className="text-blue-400 cursor-pointer" onClick={() => navigator.clipboard.writeText(condo.codigoAcesso)}/>
                        </div>
                        <Link to={`/admin/tickets/${condo._id}`} className="block text-center bg-brand-primary text-white py-2 rounded hover:opacity-90">Gerir Tickets</Link>
                    </div>
                ))}
            </div>
        </div>
    );
}