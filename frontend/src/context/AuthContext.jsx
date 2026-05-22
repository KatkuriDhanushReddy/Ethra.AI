import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      connectSocket();
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    return () => disconnectSocket();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    connectSocket();
    return data.user;
  };

  const signup = async (form) => {
    const { data } = await authAPI.signup(form);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    connectSocket();
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    disconnectSocket();
  };

  const updateUser = (u) => setUser(u);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateUser, isAdmin, refreshUser: loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
