import { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

function loadUser() {
  try {
    const u = localStorage.getItem('fs_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadUser());

  const login = async (userData) => {
    try {
      const res = await api.post('/auth/login', userData);
      const { token, user } = res.data;
      localStorage.setItem('fs_token', token);
      localStorage.setItem('fs_user', JSON.stringify(user));
      setUser(user);
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token, user } = res.data;
      localStorage.setItem('fs_token', token);
      localStorage.setItem('fs_user', JSON.stringify(user));
      setUser(user);
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('fs_token');
    localStorage.removeItem('fs_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

function getInitials(u) {
  if (u.firstName && u.lastName)
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  if (u.email) return u.email[0].toUpperCase();
  return 'U';
}
