import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const response = await api.get('/user');
                    setUser(response.data);
                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem('auth_token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password, loginType) => {
        const response = await api.post('/login', { email, password, login_type: loginType });
        localStorage.setItem('auth_token', response.data.access_token);
        setUser(response.data.user);
        return response.data;
    };

    const register = async (name, email, password, password_confirmation) => {
        const response = await api.post('/register', {
            name, email, password, password_confirmation
        });
        localStorage.setItem('auth_token', response.data.access_token);
        setUser(response.data.user);
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem('auth_token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
