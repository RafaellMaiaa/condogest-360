import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/tickets'); // Redireciona após login
        } catch (err) {
            alert('Login falhou. Verifica os dados.');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-brand-background">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-brand-primary mb-6 text-center">Entrar</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" placeholder="Email" required 
                        className="w-full p-2 border rounded"
                        value={email} onChange={e => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" placeholder="Password" required 
                        className="w-full p-2 border rounded"
                        value={password} onChange={e => setPassword(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-brand-secondary text-white py-2 rounded font-bold hover:bg-teal-600 transition">
                        Entrar
                    </button>
                </form>
                
                {/* ADICIONA ISTO AQUI EM BAIXO */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Ainda não tem conta?{' '}
                    <Link to="/registar" className="text-brand-primary font-bold hover:underline">
                        Criar nova conta
                    </Link>
                </p>
            </div>
        </div>
    );
}