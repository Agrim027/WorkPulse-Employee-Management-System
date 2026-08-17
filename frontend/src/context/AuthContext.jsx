import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const initializeAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authService.getCurrentUser();
      if (res && res.data) {
        setUser(res.data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to initialize auth user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    initializeAuth();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [initializeAuth, logout]);

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      const res = await authService.login(username, password);
      const loginData = res.data;
      if (loginData && loginData.token) {
        localStorage.setItem('token', loginData.token);
        setToken(loginData.token);

        // Fetch full profile details
        const meRes = await authService.getCurrentUser();
        if (meRes && meRes.data) {
          setUser(meRes.data);
        } else {
          setUser(loginData);
        }
        return loginData;
      } else {
        throw new Error('Invalid login response from server');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        initializeAuth,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
