import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If a token exists but user is null, we could fetch user profile here.
    // For now, we will decode from localStorage if we saved it there 
    // or just assume they are logged in based on token.
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const loginAction = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, ...userData } = res.data;
      
      setUser(userData);
      setToken(token);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Logged in successfully!');
      return userData; // Returning to component so it can redirect based on role
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const registerAction = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token, ...newUser } = res.data;
      
      setUser(newUser);
      setToken(token);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Account created successfully!');
      return newUser;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logoutAction = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginAction, registerAction, logoutAction }}>
      {children}
    </AuthContext.Provider>
  );
};
