import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Pagamentos from './pages/Pagamentos';
import Documentos from './pages/Documentos';

// Páginas existentes
import Dashboard from './pages/Dashboard';
import MeusTickets from './pages/tickets/MeusTickets';
import AdminTickets from './pages/admin/AdminTickets';
import Comunicados from './pages/Comunicados';
import DashboardAdmin from './pages/admin/DashboardAdmin'; // <--- Importa o DashboardAdmin

// Componente para Proteger Rotas
const RotaPrivada = ({ children }) => {
    const { user } = useContext(AuthContext);
    return user ? children : <Navigate to="/login" />;
};

// Componente para Proteger Rotas de Admin
const RotaAdmin = ({ children }) => {
    const { user } = useContext(AuthContext);
    return user && user.role === 'Admin' ? children : <Navigate to="/" />;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col min-h-screen bg-brand-background font-sans text-brand-text">
      {/* Só mostra o Header se estiver logado */}
      {user && <Header />}

      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registar" element={<Register />} /> {/* <--- Nova Rota */}
  

          {/* Rotas Protegidas */}
          <Route path="/" element={<RotaPrivada><Dashboard /></RotaPrivada>} />
          <Route path="/tickets" element={<RotaPrivada><MeusTickets /></RotaPrivada>} />
          <Route path="/comunicados" element={<RotaPrivada><Comunicados /></RotaPrivada>} />
          <Route path="/" element={<RotaPrivada><Dashboard /></RotaPrivada>} />
          <Route path="/pagamentos" element={<RotaPrivada><Pagamentos /></RotaPrivada>} />
          <Route path="/documentos" element={<RotaPrivada><Documentos /></RotaPrivada>} />
          {/* Rota Só para Admin */}
          <Route path="/admin/tickets" element={<RotaAdmin><AdminTickets /></RotaAdmin>} />
          <Route path="/admin/dashboard" element={<RotaAdmin><DashboardAdmin /></RotaAdmin>} />
          <Route path="/admin/tickets/:condominioId" element={<RotaAdmin><AdminTickets /></RotaAdmin>} />
        </Routes>
      </main>

      {user && <Footer />}
    </div>
  );
}

export default App;