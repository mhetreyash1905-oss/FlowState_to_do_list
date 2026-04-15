import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function loadUser() {
  try {
    const u = localStorage.getItem('fs_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadUser());

  const login = (userData) => {
    const u = { ...userData, avatarInitials: getInitials(userData) };
    localStorage.setItem('fs_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('fs_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
