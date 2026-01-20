import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-brand-primary mb-4">Bem-vindo ao seu Condomínio</h1>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto">
        Utilize o menu acima para reportar avarias, consultar avisos ou contactar o gestor.
      </p>
      
      <div className="flex justify-center gap-4">
        <Link to="/tickets" className="bg-brand-secondary text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-teal-600 transition">
          Abrir Ticket
        </Link>
        <Link to="/comunicados" className="bg-white text-brand-primary border border-brand-primary px-6 py-3 rounded-lg font-bold shadow hover:bg-gray-50 transition">
          Ver Avisos
        </Link>
      </div>
    </div>
  );
}