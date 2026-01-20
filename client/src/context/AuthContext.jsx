import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ao iniciar, verifica se há token guardado
    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    const res = await axios.get('http://localhost:5001/api/auth/me');
                    setUser(res.data);
                } catch (err) {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['x-auth-token'];
                }
            }
            setLoading(false);
        };
        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};