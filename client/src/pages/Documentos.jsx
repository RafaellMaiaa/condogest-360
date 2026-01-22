import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FileText, Download, Trash2, Upload, Building } from 'lucide-react';

const API_URL = "http://localhost:5001";

export default function Documentos() {
  const { user } = useContext(AuthContext);
  const [docs, setDocs] = useState([]);
  
  // Seleção de Prédio (Lógica igual às outras páginas)
  const [meusCondominios, setMeusCondominios] = useState([]);
  const [condominioSelecionado, setCondominioSelecionado] = useState(null);

  // Form Upload
  const [titulo, setTitulo] = useState('');
  const [ficheiro, setFicheiro] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. SETUP INICIAL
  useEffect(() => {
    if (!user) return;
    const carregarTudo = async () => {
        const token = localStorage.getItem('token');
        if (user.role === 'Admin') {
            try {
                const res = await axios.get(`${API_URL}/api/condominios`, { headers: { 'x-auth-token': token } });
                setMeusCondominios(res.data);
                if (res.data.length > 0) setCondominioSelecionado(res.data[0]._id);
            } catch (err) { console.error(err); }
        } else {
            setCondominioSelecionado(user.condominio._id || user.condominio);
        }
    };
    carregarTudo();
  }, [user]);

  // 2. CARREGAR DOCUMENTOS
  useEffect(() => {
    if (condominioSelecionado) carregarDocs();
  }, [condominioSelecionado]);

  const carregarDocs = async () => {
      try {
          const res = await axios.get(`${API_URL}/api/documentos/${condominioSelecionado}`, {
              headers: { 'x-auth-token': localStorage.getItem('token') }
          });
          setDocs(res.data);
      } catch (err) { console.error("Erro docs"); }
  };

  // 3. UPLOAD (SÓ ADMIN)
  const handleUpload = async (e) => {
      e.preventDefault();
      if (!ficheiro) return alert("Selecione um ficheiro PDF.");
      
      setLoading(true);
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('ficheiro', ficheiro);
      formData.append('condominioId', condominioSelecionado);

      try {
          await axios.post(`${API_URL}/api/documentos`, formData, {
              headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': localStorage.getItem('token') }
          });
          alert("Documento arquivado!");
          setTitulo(''); setFicheiro(null);
          carregarDocs();
      } catch (err) { alert("Erro ao enviar."); }
      setLoading(false);
  };

  const apagarDoc = async (id) => {
      if(!confirm("Apagar documento?")) return;
      try {
          await axios.delete(`${API_URL}/api/documentos/${id}`, {
              headers: { 'x-auth-token': localStorage.getItem('token') }
          });
          setDocs(docs.filter(d => d._id !== id));
      } catch (err) { alert("Erro ao apagar"); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
              <FileText /> Arquivo Digital
          </h2>

          {user?.role === 'Admin' && (
            <div className="flex items-center gap-2 bg-white p-2 rounded shadow border border-brand-secondary">
                <Building size={18} className="text-gray-400"/>
                <select 
                    className="bg-transparent font-bold outline-none text-brand-primary cursor-pointer"
                    value={condominioSelecionado || ''}
                    onChange={(e) => setCondominioSelecionado(e.target.value)}
                >
                    {meusCondominios.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
                    {meusCondominios.length === 0 && <option>Sem Prédios</option>}
                </select>
            </div>
          )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA: LISTA DE DOCUMENTOS */}
          <div className="md:col-span-2 space-y-4">
              {docs.length === 0 && (
                  <div className="bg-white p-8 rounded-xl shadow text-center border-dashed border-2 border-gray-300">
                      <FileText className="mx-auto text-gray-300 mb-2" size={48}/>
                      <p className="text-gray-500">O arquivo está vazio.</p>
                  </div>
              )}

              {docs.map(doc => (
                  <div key={doc._id} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="bg-red-50 p-2 rounded text-red-500"><FileText size={24}/></div>
                          <div>
                              <h3 className="font-bold text-gray-800">{doc.titulo}</h3>
                              <p className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          <a 
                            href={`${API_URL}${doc.caminho}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                            title="Descarregar"
                          >
                              <Download size={18}/>
                          </a>
                          
                          {user?.role === 'Admin' && (
                              <button onClick={() => apagarDoc(doc._id)} className="p-2 bg-red-50 text-red-400 rounded hover:bg-red-100 transition">
                                  <Trash2 size={18}/>
                              </button>
                          )}
                      </div>
                  </div>
              ))}
          </div>

          {/* COLUNA DIREITA: UPLOAD (SÓ ADMIN) */}
          {user?.role === 'Admin' && (
              <div className="md:col-span-1">
                  <div className="bg-white p-6 rounded-xl shadow border-t-4 border-brand-secondary h-fit sticky top-4">
                      <h3 className="font-bold mb-4 flex items-center gap-2"><Upload size={18}/> Novo Documento</h3>
                      <form onSubmit={handleUpload} className="space-y-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Nome do Ficheiro</label>
                              <input 
                                className="w-full border p-2 rounded mt-1" 
                                placeholder="Ex: Regulamento Geral" 
                                value={titulo} onChange={e=>setTitulo(e.target.value)} required 
                              />
                          </div>
                          
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Ficheiro PDF</label>
                              <input 
                                type="file" accept="application/pdf, image/*" 
                                className="w-full text-sm mt-1"
                                onChange={e => setFicheiro(e.target.files[0])} required
                              />
                          </div>

                          <button disabled={loading} className="w-full bg-brand-secondary text-white py-2 rounded font-bold hover:bg-teal-600 transition">
                              {loading ? 'A enviar...' : 'Arquivar Documento'}
                          </button>
                      </form>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
}