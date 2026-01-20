import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        password: '',
        codigoAcesso: '',
        fracao: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/auth/registar', formData);
            alert("Conta criada com sucesso! Faz login.");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.msg || "Erro ao criar conta");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-brand-background px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-brand-secondary">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-brand-primary">Criar Conta</h2>
                    <p className="text-gray-500 text-sm">Junte-se ao seu condomínio digital</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input name="nome" type="text" required onChange={handleChange} 
                               className="w-full p-2 border rounded focus:ring-2 focus:ring-brand-secondary outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input name="email" type="email" required onChange={handleChange} 
                               className="w-full p-2 border rounded focus:ring-2 focus:ring-brand-secondary outline-none" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Código Prédio <span className="text-red-500">*</span>
                            </label>
                            <input name="codigoAcesso" type="text" placeholder="Ex: PR-123" required onChange={handleChange} 
                                   className="w-full p-2 border rounded focus:ring-2 focus:ring-brand-secondary outline-none bg-yellow-50" />
                            <p className="text-xs text-gray-400 mt-1">Peça ao gestor</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sua Fração</label>
                            <input name="fracao" type="text" placeholder="Ex: 3º Esq" required onChange={handleChange} 
                                   className="w-full p-2 border rounded focus:ring-2 focus:ring-brand-secondary outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input name="password" type="password" required onChange={handleChange} 
                               className="w-full p-2 border rounded focus:ring-2 focus:ring-brand-secondary outline-none" />
                    </div>

                    <button type="submit" className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-brand-primaryDark transition">
                        Criar Conta
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Já tem conta?{' '}
                    <Link to="/login" className="text-brand-secondary font-bold hover:underline">
                        Entrar aqui
                    </Link>
                </p>
            </div>
        </div>
    );
}