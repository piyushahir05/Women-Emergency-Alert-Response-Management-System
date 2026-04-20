import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [role,  setRole]  = useState(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('wearms_token');
    const storedUser  = localStorage.getItem('wearms_user');
    const storedRole  = localStorage.getItem('wearms_role');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole || 'user');
    }
  }, []);

  const login = (newToken, newUser, newRole = 'user') => {
    setToken(newToken);
    setUser(newUser);
    setRole(newRole);
    localStorage.setItem('wearms_token', newToken);
    localStorage.setItem('wearms_user',  JSON.stringify(newUser));
    localStorage.setItem('wearms_role',  newRole);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('wearms_token');
    localStorage.removeItem('wearms_user');
    localStorage.removeItem('wearms_role');
  };

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
