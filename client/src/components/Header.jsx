import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Home, Ticket, Bell, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redireciona para o login ao sair
  };

  return (
    <header className="bg-brand-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto bg-white rounded p-1" />
          <div className="leading-tight hidden md:block">
            <h1 className="text-lg font-bold">CondoGest <span className="text-brand-secondary">360</span></h1>
            {user?.condominio && <p className="text-xs opacity-70 font-normal">{user.condominio.nome}</p>}
          </div>
        </Link>

        {/* NAVEGAÇÃO */}
        <nav className="flex items-center gap-4 md:gap-6 font-medium text-sm">
          
          {/* Se estiver logado, mostra o menu */}
          {user ? (
            <>
              {/* Links Comuns */}
              <Link to="/" className="hidden md:flex items-center gap-1 hover:text-brand-secondary transition">
                <Home size={18} /> <span className="hidden lg:inline">Início</span>
              </Link>
              
              {/* Link de Inquilino */}
              {user.role === 'Inquilino' && (
                <Link to="/tickets" className="flex items-center gap-1 hover:text-brand-secondary transition">
                  <Ticket size={18} /> Tickets
                </Link>
              )}

              {/* Link de Admin */}
              {user.role === 'Admin' && (
                <Link to="/admin/dashboard" className="flex items-center gap-1 text-brand-secondary hover:text-white transition border border-brand-secondary px-3 py-1 rounded-full bg-brand-primaryDark/30">
                  <LayoutDashboard size={16} /> Gestor
                </Link>
              )}

              <Link to="/comunicados" className="flex items-center gap-1 hover:text-brand-secondary transition">
                <Bell size={18} /> <span className="hidden lg:inline">Avisos</span>
              </Link>

              <Link to="/pagamentos" className="flex items-center gap-1 hover:text-brand-secondary transition">
              <span className="font-bold">€</span> Quotas
              </Link>

              {/* SEPARADOR */}
              <div className="h-6 w-px bg-blue-800 mx-2"></div>

              {/* PERFIL & LOGOUT */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-sm font-bold leading-none">{user.nome}</span>
                  <span className="text-xs text-brand-secondary">{user.fracao}</span>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-200 hover:text-white px-3 py-2 rounded-lg transition border border-red-500/30"
                  title="Sair da Conta"
                >
                  <LogOut size={18} />
                  <span className="hidden md:inline">Sair</span>
                </button>
              </div>
            </>
          ) : (
            /* Se NÃO estiver logado */
            <div className="flex gap-4">
              <Link to="/login" className="hover:text-brand-secondary transition py-2">Entrar</Link>
              <Link to="/registar" className="bg-brand-secondary hover:bg-teal-600 text-white px-4 py-2 rounded font-bold transition">
                Registar
              </Link>
            </div>
          )}
        </nav>

      </div>
    </header>
  );
}