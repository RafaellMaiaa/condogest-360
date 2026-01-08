import { useState, useEffect } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { jsPDF } from "jspdf"

const COLORS = ['#27ae60', '#ecf0f1'];

function App() {
  // --- ESTADOS GERAIS ---
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  
  // Dados Formulários Login
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ nome: '', email: '', password: '', role: 'admin', fracaoId: '' })

  // Estados de Dados (Admin & Inquilino)
  const [view, setView] = useState('lista') // 'lista' ou 'detalhe'
  const [condominios, setCondominios] = useState([])
  const [condominioSelecionado, setCondominioSelecionado] = useState(null)
  const [fracoes, setFracoes] = useState([])
  const [tickets, setTickets] = useState([])
  const [historicoPagamentos, setHistoricoPagamentos] = useState([])
  const [dadosInquilino, setDadosInquilino] = useState(null)

  // Inputs de Criação
  const [novoCondominio, setNovoCondominio] = useState({ nome: '', nif: '', morada: '' })
  const [novaFracao, setNovaFracao] = useState({ nome: '', permilagem: 0, tipo: 'Habitação' })
  const [novoTicket, setNovoTicket] = useState({ titulo: '', descricao: '', prioridade: 'Média', zona: 'Geral', piso: '0', componente: 'Outro' })
  const [novaMensagem, setNovaMensagem] = useState({ fracao: 'geral', assunto: '', conteudo: '' })
  
  // Estado para os Chats (Texto a escrever em cada ticket)
  const [textoComentario, setTextoComentario] = useState({}) 

  // --- EFEITOS (Carregar dados e manter sessão) ---
  useEffect(() => {
    const saved = localStorage.getItem('condogest_user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (user && user.role === 'admin') carregarCondominios()
    if (user && user.role === 'inquilino') carregarDadosInquilino()
  }, [user])

  // --- API CALLS DE DADOS ---
  const carregarCondominios = async () => { try { const res = await axios.get('http://localhost:5001/api/condominios'); setCondominios(res.data); } catch(e){} }
  
  const carregarDadosPrédio = async (id) => {
    const resF = await axios.get(`http://localhost:5001/api/fracoes/${id}`)
    const resT = await axios.get(`http://localhost:5001/api/tickets/${id}`)
    const resH = await axios.get(`http://localhost:5001/api/movimentos/historico/${id}`)
    setFracoes(resF.data); setTickets(resT.data); setHistoricoPagamentos(resH.data)
  }

  const carregarDadosInquilino = async () => {
    if(!user.fracao) return;
    try { const res = await axios.get(`http://localhost:5001/api/inquilino/dados/${user.fracao}`); setDadosInquilino(res.data); } catch(e){}
  }

  // --- PDF PROFISSIONAL (DESIGN VECTORIAL) ---
  const gerarReciboPDF = (dadosPagamento) => {
    try {
      const doc = new jsPDF()
      // 1. Cabeçalho Azul
      doc.setFillColor(44, 62, 80); doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text("CondoGest 360", 20, 20)
      doc.setFontSize(10); doc.text("Sistema Integrado de Gestão", 20, 30)
      doc.text("Recibo Original", 190, 30, { align: "right" })

      // 2. Título
      doc.setTextColor(0, 0, 0); doc.setFontSize(18); 
      doc.text(`RECIBO Nº ${dadosPagamento.numeroRecibo || '---'}`, 105, 60, { align: "center" })

      // 3. Caixa de Dados
      doc.setFillColor(245, 245, 245); doc.setDrawColor(220); 
      doc.roundedRect(20, 70, 170, 60, 3, 3, 'FD');
      
      doc.setFontSize(12); doc.setTextColor(100);
      doc.text("Fração:", 30, 90); doc.text("Data:", 30, 105); doc.text("Valor Pago:", 30, 120);
      
      doc.setTextColor(0); 
      doc.text(dadosPagamento.fracao?.nome || "Fração", 70, 90);
      doc.text(new Date(dadosPagamento.data).toLocaleDateString(), 70, 105);
      
      doc.setFontSize(16); doc.setTextColor(39, 174, 96);
      doc.text(`${Number(dadosPagamento.valor).toFixed(2)} €`, 70, 120);

      // 4. Rodapé
      doc.setFontSize(9); doc.setTextColor(150);
      doc.text("Processado por computador - CondoGest 360", 105, 270, { align: "center" })

      doc.save(`Recibo_${dadosPagamento.numeroRecibo}.pdf`)
    } catch(e) { console.error(e); alert("Erro ao gerar PDF") }
  }

  // --- AÇÕES DO SISTEMA ---
  
  // 1. Mudar Estado do Ticket (Com Confirmação)
  const handleMudarEstado = async (ticketId, novoEstado) => {
    if (novoEstado === 'Concluído') {
      const confirm = window.confirm("⚠️ Tens a certeza que queres concluir este ticket?\n\nO chat será bloqueado.");
      if (!confirm) return;
    }
    try {
      await axios.put(`http://localhost:5001/api/tickets/${ticketId}/estado`, { estado: novoEstado })
      if (user.role === 'admin') carregarDadosPrédio(condominioSelecionado._id)
      else carregarDadosInquilino()
    } catch(e) { alert("Erro ao mudar estado") }
  }

  // 2. Enviar Comentário no Chat
  const handleEnviarComentario = async (ticketId) => {
    const texto = textoComentario[ticketId];
    if (!texto) return;
    try {
      await axios.post(`http://localhost:5001/api/tickets/${ticketId}/comentarios`, {
        texto: texto,
        autor: user.role === 'admin' ? 'Gestor' : 'Inquilino'
      })
      setTextoComentario({ ...textoComentario, [ticketId]: '' })
      if (user.role === 'admin') carregarDadosPrédio(condominioSelecionado._id)
      else carregarDadosInquilino()
    } catch(e) { alert(e.response?.data?.erro || "Erro ao comentar") }
  }

  // 3. Login / Logout
  const handleLogin = async (e) => { e.preventDefault(); try { const res = await axios.post('http://localhost:5001/api/auth/login', loginData); setUser(res.data); localStorage.setItem('condogest_user', JSON.stringify(res.data)); } catch(e){alert('Erro Login');} }
  const handleRegister = async (e) => { e.preventDefault(); try { await axios.post('http://localhost:5001/api/auth/register', registerData); alert('Conta criada!'); setAuthMode('login'); } catch(e){alert('Erro Registo');} }
  const handleLogout = () => { setUser(null); setView('lista'); setDadosInquilino(null); localStorage.removeItem('condogest_user'); }

  // 4. Outras Ações (Criar, Pagar, Mensagens)
  const handleCriarCondominio = async (e) => { e.preventDefault(); await axios.post('http://localhost:5001/api/condominios', novoCondominio); setNovoCondominio({nome:'',nif:'',morada:''}); carregarCondominios(); }
  const abrirCondominio = (c) => { setCondominioSelecionado(c); carregarDadosPrédio(c._id); setView('detalhe'); }
  const handleCriarFracao = async (e) => { e.preventDefault(); await axios.post('http://localhost:5001/api/fracoes', {...novaFracao, condominio: condominioSelecionado._id}); carregarDadosPrédio(condominioSelecionado._id); }
  const handleCriarTicket = async (e) => { e.preventDefault(); await axios.post('http://localhost:5001/api/tickets', {...novoTicket, condominio: condominioSelecionado._id}); setNovoTicket({...novoTicket, titulo:'',descricao:''}); carregarDadosPrédio(condominioSelecionado._id); }
  const handleAtualizarOrcamento = async () => { const v=prompt("Valor:",condominioSelecionado.orcamentoAnual||0); if(v) await axios.put(`http://localhost:5001/api/condominios/${condominioSelecionado._id}`,{orcamentoAnual:Number(v)}); carregarCondominios(); abrirCondominio({...condominioSelecionado, orcamentoAnual:Number(v)}); }
  const handleRegistarPagamento = async (fracao) => { const v=prompt("Valor:"); if(v) { const res = await axios.post('http://localhost:5001/api/movimentos',{fracao:fracao._id,tipo:'Pagamento',valor:Number(v)}); gerarReciboPDF(res.data); carregarDadosPrédio(condominioSelecionado._id); } }
  const handleEnviarMensagem = async (e) => { e.preventDefault(); await axios.post('http://localhost:5001/api/messages', {...novaMensagem, condominio: condominioSelecionado._id}); alert('Enviada!'); setNovaMensagem({fracao:'geral',assunto:'',conteudo:''}); }
  const calcularQuota = (perm) => { const orc = condominioSelecionado.orcamentoAnual || 0; return orc===0?"0.00":((orc*perm)/1000/12).toFixed(2); }
  const dadosGrafico = condominioSelecionado ? [{name:'Rec',value:fracoes.reduce((a,f)=>a+(f.totalPago||0),0)},{name:'Falta',value:(condominioSelecionado.orcamentoAnual||0)-fracoes.reduce((a,f)=>a+(f.totalPago||0),0)}] : []

  // --- COMPONENTE AUXILIAR: CAIXA DE CHAT ---
  const renderChatBox = (t) => (
    <div style={{marginTop:'10px',background:'#f9f9f9',padding:'15px',borderRadius:'8px',border:'1px solid #eee'}}>
       <div style={{fontSize:'0.8em',fontWeight:'bold',color:'#7f8c8d',marginBottom:'10px',textTransform:'uppercase'}}>💬 Histórico da Conversa</div>
       
       <div style={{maxHeight:'150px',overflowY:'auto',marginBottom:'15px',display:'flex',flexDirection:'column',gap:'8px'}}>
          {t.comentarios && t.comentarios.map((c, i) => (
             <div key={i} style={{alignSelf: c.autor==='Gestor'?'flex-start':'flex-end', background: c.autor==='Gestor'?'#e8f4fd':'#e9f7ef', padding:'8px 12px', borderRadius:'12px', maxWidth:'80%', fontSize:'0.9em'}}>
                <strong style={{color: c.autor==='Gestor'?'#2980b9':'#27ae60', display:'block', fontSize:'0.8em'}}>{c.autor}</strong>
                {c.texto}
             </div>
          ))}
          {(!t.comentarios || t.comentarios.length===0) && <span style={{fontSize:'0.8em',color:'#ccc',textAlign:'center'}}>Sem mensagens ainda.</span>}
       </div>
       
       {t.estado === 'Concluído' ? (
         <div style={{background:'#fadbd8', color:'#c0392b', padding:'10px', borderRadius:'6px', textAlign:'center', fontSize:'0.9em', border:'1px solid #e6b0aa', fontWeight:'bold'}}>
           🔒 TICKET FECHADO - Conversa Bloqueada
         </div>
       ) : (
         <div style={{display:'flex',gap:'10px'}}>
            <input 
              placeholder="Escreve uma resposta..." 
              value={textoComentario[t._id] || ''}
              onChange={(e) => setTextoComentario({...textoComentario, [t._id]: e.target.value})}
              style={{flex:1,padding:'10px',borderRadius:'6px',border:'1px solid #ddd', outline:'none'}}
            />
            <button onClick={() => handleEnviarComentario(t._id)} style={{background:'#2980b9',color:'white',border:'none',borderRadius:'6px',cursor:'pointer',padding:'0 20px',fontWeight:'bold'}}>Enviar</button>
         </div>
       )}
    </div>
  )

  // ==========================================
  // RENDER: ECRÃ DE LOGIN (PREMIUM DESIGN)
  // ==========================================
  if (!user) return (
    <div style={{width:'100vw',height:'100vh',position:'absolute',top:0,left:0,display:'flex',justifyContent:'center',alignItems:'center',background:'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',fontFamily:"'Segoe UI', sans-serif"}}>
      <div style={{background:'white',padding:'40px',borderRadius:'16px',width:'100%',maxWidth:'400px',boxShadow:'0 20px 50px rgba(0,0,0,0.3)',margin:'20px'}}>
        <div style={{textAlign:'center',marginBottom:'30px'}}>
          <h1 style={{color:'#2c3e50',margin:'0 0 10px 0',fontSize:'2em'}}>CondoGest 360</h1>
          <p style={{color:'#7f8c8d',margin:0}}>Plataforma de Gestão Inteligente</p>
        </div>
        
        {authMode === 'login' ? (
          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'15px'}}>
            <input type="email" placeholder="O teu Email" value={loginData.email} onChange={e=>setLoginData({...loginData,email:e.target.value})} required style={{padding:'15px',border:'1px solid #ddd',borderRadius:'8px',fontSize:'1rem',background:'#f8f9fa'}}/>
            <input type="password" placeholder="A tua Senha" value={loginData.password} onChange={e=>setLoginData({...loginData,password:e.target.value})} required style={{padding:'15px',border:'1px solid #ddd',borderRadius:'8px',fontSize:'1rem',background:'#f8f9fa'}}/>
            <button type="submit" style={{padding:'15px',background:'#27ae60',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',fontSize:'1rem',cursor:'pointer',marginTop:'10px'}}>ENTRAR</button>
            <p style={{textAlign:'center',color:'#666',marginTop:'15px'}}>Não tens conta? <span onClick={()=>setAuthMode('register')} style={{color:'#3498db',fontWeight:'bold',cursor:'pointer'}}>Criar Conta</span></p>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{display:'flex',flexDirection:'column',gap:'15px'}}>
            <input placeholder="Nome Completo" value={registerData.nome} onChange={e=>setRegisterData({...registerData,nome:e.target.value})} required style={{padding:'12px',border:'1px solid #ddd',borderRadius:'8px'}}/>
            <input placeholder="Email" value={registerData.email} onChange={e=>setRegisterData({...registerData,email:e.target.value})} required style={{padding:'12px',border:'1px solid #ddd',borderRadius:'8px'}}/>
            <input type="password" placeholder="Senha" value={registerData.password} onChange={e=>setRegisterData({...registerData,password:e.target.value})} required style={{padding:'12px',border:'1px solid #ddd',borderRadius:'8px'}}/>
            <select value={registerData.role} onChange={e=>setRegisterData({...registerData,role:e.target.value})} style={{padding:'12px',border:'1px solid #ddd',borderRadius:'8px',background:'white'}}>
              <option value="admin">Sou Gestor (Admin)</option><option value="inquilino">Sou Inquilino</option>
            </select>
            {registerData.role==='inquilino' && (
              <div style={{background:'#fff3cd',padding:'10px',borderRadius:'8px',border:'1px solid #ffeeba'}}>
                 <p style={{margin:'0 0 5px 0',fontSize:'0.8em',color:'#856404',fontWeight:'bold'}}>ID DA FRAÇÃO (Pede ao Gestor):</p>
                 <input placeholder="Cola o ID aqui..." value={registerData.fracaoId} onChange={e=>setRegisterData({...registerData,fracaoId:e.target.value})} style={{width:'93%',padding:'8px',border:'1px solid #ddd',borderRadius:'4px'}}/>
              </div>
            )}
            <button type="submit" style={{padding:'15px',background:'#e67e22',color:'white',border:'none',borderRadius:'8px',fontWeight:'bold',cursor:'pointer'}}>CRIAR CONTA</button>
            <p style={{textAlign:'center',color:'#666',marginTop:'15px'}}>Já tens conta? <span onClick={()=>setAuthMode('login')} style={{color:'#3498db',fontWeight:'bold',cursor:'pointer'}}>Entrar</span></p>
          </form>
        )}
      </div>
    </div>
  )

  // ==========================================
  // RENDER: PAINEL INQUILINO (CLEAN DESIGN)
  // ==========================================
  if (user.role === 'inquilino') {
    if (!dadosInquilino) return <div style={{padding:'40px',textAlign:'center',fontFamily:'sans-serif'}}>A carregar dados...</div>
    return (
      <div style={{padding:'40px',maxWidth:'900px',margin:'0 auto',fontFamily:"'Segoe UI', sans-serif",color:'#333'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #eee',paddingBottom:'20px',marginBottom:'30px'}}>
            <h1 style={{color:'#2c3e50',margin:0}}>🏠 Minha Casa <span style={{fontSize:'0.6em',color:'#7f8c8d',fontWeight:'normal'}}>| {dadosInquilino.condominio.nome}</span></h1>
            <button onClick={handleLogout} style={{background:'#e74c3c',color:'white',border:'none',padding:'8px 20px',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}}>Sair</button>
        </div>

        <div style={{background:'linear-gradient(to right, #d4edda, #c3e6cb)',padding:'30px',borderRadius:'12px',marginBottom:'30px',boxShadow:'0 4px 10px rgba(0,0,0,0.05)'}}>
            <h2 style={{margin:'0 0 10px 0',color:'#155724'}}>Olá, {user.nome}!</h2>
            <p style={{margin:'5px 0'}}>Vives na fração: <strong style={{fontSize:'1.2em'}}>{dadosInquilino.fracao.nome}</strong></p>
            <p style={{margin:'0'}}>Permilagem: {dadosInquilino.fracao.permilagem}‰</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'40px'}}>
          {/* ESQUERDA: RECIBOS E MENSAGENS */}
          <div>
            <div style={{background:'#eaf6ff',padding:'20px',borderRadius:'10px',marginBottom:'30px',border:'1px solid #d6eaf8'}}>
              <h3 style={{margin:'0 0 15px 0',color:'#2980b9'}}>📬 Avisos do Gestor</h3>
              {dadosInquilino.mensagens && dadosInquilino.mensagens.length > 0 ? (
                <ul style={{listStyle:'none',padding:0}}>
                  {dadosInquilino.mensagens.map(m => (
                    <li key={m._id} style={{background:'white',padding:'15px',marginBottom:'10px',borderRadius:'8px',borderLeft:'4px solid #3498db',boxShadow:'0 2px 4px rgba(0,0,0,0.02)'}}>
                      <div style={{fontWeight:'bold',color:'#2c3e50'}}>{m.assunto}</div>
                      <div style={{color:'#555',marginTop:'5px',lineHeight:'1.4'}}>{m.conteudo}</div>
                      <div style={{marginTop:'8px'}}>{m.fracao===null?<span style={{fontSize:'0.7em',background:'#eee',padding:'3px 8px',borderRadius:'10px',color:'#666'}}>Geral</span>:<span style={{fontSize:'0.7em',background:'#d4edda',padding:'3px 8px',borderRadius:'10px',color:'#155724'}}>Privado</span>}</div>
                    </li>
                  ))}
                </ul>
              ) : <p style={{color:'#7f8c8d'}}>Não há mensagens novas.</p>}
            </div>

            <h3 style={{color:'#27ae60',borderBottom:'2px solid #27ae60',paddingBottom:'10px'}}>📄 Recibos de Pagamento</h3>
            <ul style={{listStyle:'none',padding:0}}>
                {dadosInquilino.pagamentos.map(p => (
                    <li key={p._id} style={{padding:'15px',background:'white',border:'1px solid #eee',marginBottom:'10px',borderRadius:'8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div><div style={{fontWeight:'bold'}}>Recibo #{p.numeroRecibo}</div><div style={{fontSize:'0.85em',color:'#999'}}>{new Date(p.data).toLocaleDateString()}</div></div>
                        <div style={{textAlign:'right'}}><div style={{color:'#27ae60',fontWeight:'bold',marginBottom:'5px'}}>{p.valor} €</div><button onClick={()=>gerarReciboPDF(p)} style={{cursor:'pointer',fontSize:'0.8em',padding:'5px 10px',background:'#f8f9fa',border:'1px solid #ddd',borderRadius:'4px'}}>📥 Baixar</button></div>
                    </li>
                ))}
            </ul>
          </div>

          {/* DIREITA: TICKETS */}
          <div>
            <h3 style={{color:'#c0392b',borderBottom:'2px solid #c0392b',paddingBottom:'10px'}}>🛠️ Minhas Avarias</h3>
            {dadosInquilino.tickets.length === 0 ? <p style={{color:'#999'}}>Tudo a funcionar corretamente.</p> : dadosInquilino.tickets.map(t => (
                <div key={t._id} style={{background:'#fff',border:'1px solid #eee',padding:'20px',marginBottom:'20px',borderRadius:'10px',borderLeft:`5px solid ${t.estado==='Concluído'?'#27ae60':t.estado==='Em Resolução'?'#f39c12':'#c0392b'}`, boxShadow:'0 4px 6px rgba(0,0,0,0.02)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <strong style={{fontSize:'1.1em', color:'#2c3e50'}}>{t.titulo}</strong>
                        <span style={{fontWeight:'bold',color:t.estado==='Concluído'?'#27ae60':t.estado==='Em Resolução'?'#f39c12':'#c0392b', background:'#f9f9f9', padding:'4px 8px', borderRadius:'6px', fontSize:'0.8em'}}>{t.estado}</span>
                    </div>
                    <p style={{margin:'10px 0',color:'#666',lineHeight:'1.5'}}>{t.descricao}</p>
                    {renderChatBox(t)}
                </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // RENDER: PAINEL ADMIN
  // ==========================================
  if (view === 'lista') {
    return (
      <div style={{padding:'40px',maxWidth:'1000px',margin:'0 auto',fontFamily:"'Segoe UI', sans-serif",color:'#333'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'30px'}}>
            <div><h1 style={{color:'#2c3e50',margin:0}}>🏢 Painel de Gestão</h1><p style={{margin:0,color:'#7f8c8d'}}>Admin: <strong>{user.nome}</strong></p></div>
            <button onClick={handleLogout} style={{background:'#c0392b',color:'white',border:'none',padding:'10px 20px',borderRadius:'6px',cursor:'pointer'}}>Sair</button>
        </div>
        
        <div style={{background:'white',padding:'25px',borderRadius:'12px',marginBottom:'30px',boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
          <h3 style={{marginTop:0}}>+ Registar Novo Condomínio</h3>
          <form onSubmit={handleCriarCondominio} style={{display:'flex',gap:'15px',flexWrap:'wrap'}}>
            <input placeholder="Nome do Prédio" value={novoCondominio.nome} onChange={e=>setNovoCondominio({...novoCondominio,nome:e.target.value})} style={{padding:'12px',border:'1px solid #ddd',borderRadius:'6px',flex:1}}/>
            <input placeholder="NIF" value={novoCondominio.nif} onChange={e=>setNovoCondominio({...novoCondominio,nif:e.target.value})} style={{padding:'12px',border:'1px solid #ddd',borderRadius:'6px',width:'150px'}}/>
            <input placeholder="Morada" value={novoCondominio.morada} onChange={e=>setNovoCondominio({...novoCondominio,morada:e.target.value})} style={{padding:'12px',border:'1px solid #ddd',borderRadius:'6px',flex:1}}/>
            <button type="submit" style={{background:'#27ae60',color:'white',border:'none',padding:'12px 25px',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}}>Criar</button>
          </form>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'20px'}}>
          {condominios.map(c => (
            <div key={c._id} onClick={()=>abrirCondominio(c)} style={{padding:'25px',border:'1px solid #eee',cursor:'pointer',borderRadius:'12px',background:'white',boxShadow:'0 4px 6px rgba(0,0,0,0.02)',transition:'0.2s'}}>
              <div style={{fontSize:'2em',marginBottom:'10px'}}>🏢</div>
              <strong style={{fontSize:'1.2em',color:'#2c3e50'}}>{c.nome}</strong>
              <div style={{fontSize:'0.9em',color:'#7f8c8d',marginTop:'5px'}}>{c.morada}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // DETALHE ADMIN
  return (
    <div style={{padding:'30px',maxWidth:'1200px',margin:'0 auto',fontFamily:"'Segoe UI', sans-serif",color:'#333'}}>
      <button onClick={()=>setView('lista')} style={{marginBottom:'20px',cursor:'pointer',border:'none',background:'none',color:'#666',fontSize:'1rem'}}>⬅ Voltar</button>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'30px',borderBottom:'1px solid #ddd',paddingBottom:'20px'}}>
        <h1 style={{margin:0,color:'#2c3e50'}}>{condominioSelecionado.nome}</h1>
        <span style={{background:'#f8f9fa',padding:'8px 15px',borderRadius:'20px',border:'1px solid #ddd',color:'#666'}}>NIF: {condominioSelecionado.nif}</span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'40px'}}>
        <div>
          {/* ORÇAMENTO */}
          <div style={{background:'white',padding:'25px',borderRadius:'12px',marginBottom:'30px',border:'1px solid #eee',boxShadow:'0 4px 10px rgba(0,0,0,0.03)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><h4 style={{margin:'0 0 10px 0',color:'#27ae60',textTransform:'uppercase',fontSize:'0.8em'}}>Orçamento Anual</h4><strong style={{fontSize:'2em',color:'#2c3e50'}}>{condominioSelecionado.orcamentoAnual||0} €</strong><div style={{marginTop:'10px'}}><button onClick={handleAtualizarOrcamento} style={{background:'#f8f9fa',color:'#333',border:'1px solid #ddd',padding:'6px 12px',borderRadius:'4px',cursor:'pointer',fontSize:'0.8em'}}>✏️ Alterar</button></div></div>
            <div style={{width:'140px',height:'140px'}}>{condominioSelecionado.orcamentoAnual>0 && <ResponsiveContainer><PieChart><Pie data={dadosGrafico} innerRadius={40} outerRadius={60} dataKey="value">{dadosGrafico.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>}</div>
          </div>

          {/* MENSAGENS */}
          <div style={{background:'#f0f4f8',padding:'25px',borderRadius:'12px',marginBottom:'30px'}}>
             <h3 style={{margin:'0 0 15px 0',color:'#2980b9'}}>📧 Enviar Aviso / Mensagem</h3>
             <form onSubmit={handleEnviarMensagem} style={{display:'flex',flexDirection:'column',gap:'15px'}}>
                <select value={novaMensagem.fracao} onChange={e=>setNovaMensagem({...novaMensagem,fracao:e.target.value})} style={{padding:'10px',borderRadius:'6px',border:'1px solid #ccc'}}>
                  <option value="geral">📢 PARA TODOS (Geral)</option>
                  {fracoes.map(f=><option key={f._id} value={f._id}>👤 Apenas {f.nome}</option>)}
                </select>
                <input placeholder="Assunto" value={novaMensagem.assunto} onChange={e=>setNovaMensagem({...novaMensagem,assunto:e.target.value})} style={{padding:'10px',borderRadius:'6px',border:'1px solid #ccc'}} required />
                <textarea placeholder="Escreve a mensagem..." value={novaMensagem.conteudo} onChange={e=>setNovaMensagem({...novaMensagem,conteudo:e.target.value})} style={{padding:'10px',minHeight:'80px',borderRadius:'6px',border:'1px solid #ccc'}} required />
                <button type="submit" style={{background:'#2980b9',color:'white',border:'none',padding:'12px',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}}>Enviar Aviso</button>
             </form>
          </div>

          <h3 style={{color:'#e67e22',borderBottom:'2px solid #e67e22',paddingBottom:'10px'}}>🏠 Frações & Contas</h3>
          <p style={{fontSize:'0.9em',color:'#666'}}>Copia o ID para enviar aos Inquilinos:</p>
          <form onSubmit={handleCriarFracao} style={{display:'flex',gap:'10px',marginBottom:'20px',background:'#fff8e1',padding:'15px',borderRadius:'8px'}}>
            <input placeholder="Ex: 3º Esq" value={novaFracao.nome} onChange={e=>setNovaFracao({...novaFracao,nome:e.target.value})} style={{padding:'8px',borderRadius:'4px',border:'1px solid #ddd'}}/>
            <input placeholder="Perm." value={novaFracao.permilagem} onChange={e=>setNovaFracao({...novaFracao,permilagem:e.target.value})} style={{width:'80px',padding:'8px',borderRadius:'4px',border:'1px solid #ddd'}}/>
            <button type="submit" style={{background:'#e67e22',color:'white',border:'none',cursor:'pointer',padding:'8px 15px',borderRadius:'4px',fontWeight:'bold'}}>+ Adicionar</button>
          </form>
          <table style={{width:'100%',borderCollapse:'collapse',background:'white',boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
            <thead><tr style={{background:'#f8f9fa',textAlign:'left',color:'#666'}}><th style={{padding:'12px'}}>Fração / ID</th><th>Quota</th><th>Pago</th><th>Ações</th></tr></thead>
            <tbody>
              {fracoes.map(f=><tr key={f._id} style={{borderBottom:'1px solid #eee'}}>
                <td style={{padding:'12px'}}><div style={{fontWeight:'bold',color:'#2c3e50'}}>{f.nome}</div><div onClick={()=>{navigator.clipboard.writeText(f._id);alert('ID copiado!')}} style={{fontSize:'0.75em',color:'#3498db',cursor:'pointer',marginTop:'4px',background:'#eaf6ff',display:'inline-block',padding:'2px 6px',borderRadius:'4px'}}>🆔 Copiar ID: {f._id}</div></td>
                <td>{calcularQuota(f.permilagem)}€</td>
                <td style={{color:'#27ae60',fontWeight:'bold'}}>{f.totalPago}€</td>
                <td style={{padding:'12px'}}><button onClick={()=>handleRegistarPagamento(f)} style={{background:'#27ae60',color:'white',border:'none',borderRadius:'4px',cursor:'pointer',padding:'6px 12px',fontSize:'0.9em'}}>$ Pagar</button></td>
              </tr>)}
            </tbody>
          </table>
        </div>

        <div>
          <h3 style={{color:'#c0392b',borderBottom:'2px solid #c0392b',paddingBottom:'10px'}}>🛠️ Avarias & Manutenção</h3>
          <div style={{background:'white',padding:'20px',borderRadius:'12px',marginBottom:'20px',border:'1px solid #eee',boxShadow:'0 4px 10px rgba(0,0,0,0.03)'}}>
            <form onSubmit={handleCriarTicket} style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <input placeholder="Título da Avaria" value={novoTicket.titulo} onChange={e=>setNovoTicket({...novoTicket,titulo:e.target.value})} style={{padding:'10px',borderRadius:'6px',border:'1px solid #ddd'}}/>
              <textarea placeholder="Descrição..." value={novoTicket.descricao} onChange={e=>setNovoTicket({...novoTicket,descricao:e.target.value})} style={{padding:'10px',borderRadius:'6px',border:'1px solid #ddd',minHeight:'60px'}}/>
              <button type="submit" style={{background:'#c0392b',color:'white',border:'none',padding:'10px',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}}>🚨 Registar Ticket</button>
            </form>
          </div>
          
          <div style={{maxHeight:'600px',overflowY:'auto'}}>
            {tickets.map(t => (
              <div key={t._id} style={{background:'white',border:'1px solid #eee',padding:'20px',marginBottom:'15px',borderRadius:'8px',borderLeft:`4px solid ${t.estado==='Concluído'?'#27ae60':'#c0392b'}`,boxShadow:'0 2px 4px rgba(0,0,0,0.02)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                   <strong style={{color:'#2c3e50',fontSize:'1.1em'}}>{t.titulo}</strong>
                   <select 
                      value={t.estado} 
                      onChange={(e) => handleMudarEstado(t._id, e.target.value)}
                      style={{padding:'6px',fontWeight:'bold',borderRadius:'6px',border:'1px solid #ccc',cursor:'pointer',background: t.estado==='Concluído'?'#e8f5e9':'#fff'}}
                   >
                      <option value="Aberto">🔴 Aberto</option>
                      <option value="Em Resolução">🟠 Em Resolução</option>
                      <option value="Concluído">🟢 Concluído</option>
                   </select>
                </div>
                <p style={{color:'#666',fontSize:'0.95em',lineHeight:'1.5'}}>{t.descricao}</p>
                {renderChatBox(t)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App