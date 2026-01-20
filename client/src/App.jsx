import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Páginas
import Dashboard from './pages/Dashboard';
import MeusTickets from './pages/tickets/MeusTickets';
import AdminTickets from './pages/admin/AdminTickets';
import Comunicados from './pages/Comunicados';

function App() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tickets" element={<MeusTickets />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/comunicados" element={<Comunicados />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;