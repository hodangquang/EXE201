import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../utils/constants';
import { getSession, saveSession, clearSession, onAuthChange, authFetch, apiUrl, incrementRequest, decrementRequest } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSession());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getSession());

  useEffect(() => {
    const unsub = onAuthChange(() => {
      const s = getSession();
      setUser(s);
      setIsAuthenticated(!!s);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    incrementRequest();
    try {
      const res = await fetch(apiUrl('/api/Auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');
      
      // Chỉ các vai trò vận hành được vào cổng đăng nhập này.
      const rawRole = data.data?.role || data.role || '';
      const role = String(rawRole).toUpperCase();
      
      if (role !== ROLES.ADMIN && role !== ROLES.STAFF && role !== ROLES.SHIPPER) {
        throw new Error('Bạn không có quyền truy cập cổng vận hành.');
      }
      
      const sessionData = { ...(data.data || data), role };
      saveSession(sessionData);
      return { ...data, data: sessionData, role };
    } finally {
      decrementRequest();
    }
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
