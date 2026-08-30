import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { normalizeAuthUser } from '../auth';
import api, { payloadOf } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('agromarket_token')));

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('agromarket_token')) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const response = await api.get('/auth/me');
      const nextUser = normalizeAuthUser(payloadOf(response));
      setUser(nextUser);
      return nextUser;
    } catch {
      localStorage.removeItem('agromarket_token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    const handleUnauthorized = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('agromarket:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('agromarket:unauthorized', handleUnauthorized);
  }, [refreshUser]);

  const authenticate = async (path, credentials) => {
    const response = await api.post(path, credentials);
    const data = payloadOf(response);
    const token = data?.token || data?.access_token || response.data?.token;
    if (!token) throw new Error('Серверот не врати токен за најава.');
    localStorage.setItem('agromarket_token', token);
    return refreshUser();
  };

  const login = (credentials) => authenticate('/auth/login', credentials);
  const register = (details) => authenticate('/auth/register', details);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Local sign-out must still work when the API is temporarily unavailable.
    } finally {
      localStorage.removeItem('agromarket_token');
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'admin' || Boolean(user?.is_admin);
  const value = { user, loading, isAdmin, login, register, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth мора да се користи во AuthProvider.');
  return context;
}
