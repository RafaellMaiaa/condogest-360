import { Link } from 'react-router-dom';
import { Home, Ticket, ClipboardList, Bell } from 'lucide-react'; // Ícones fixes

export default function Header() {
  return (
    <header className="bg-brand-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto bg-white rounded p-1" />
          <h1 className="text-xl font-bold hidden md:block">
            CondoGest <span className="text-brand-secondary">360</span>
          </h1>
        </Link>

        {/* MENU */}
        <nav className="flex gap-6 font-medium text-sm">
          <Link to="/" className="flex items-center gap-1 hover:text-brand-secondary transition">
            <Home size={18} /> Início
          </Link>
          <Link to="/tickets" className="flex items-center gap-1 hover:text-brand-secondary transition">
            <Ticket size={18} /> Apoio
          </Link>
          <Link to="/comunicados" className="flex items-center gap-1 hover:text-brand-secondary transition">
            <Bell size={18} /> Avisos
          </Link>
          
          {/* Link para Admin (temporário, para testares) */}
          <Link to="/admin/tickets" className="flex items-center gap-1 text-brand-secondary hover:text-white transition border border-brand-secondary px-3 py-1 rounded">
            <ClipboardList size={18} /> Gestor
          </Link>
        </nav>

      </div>
    </header>
  );
}