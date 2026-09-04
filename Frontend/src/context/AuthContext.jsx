import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('nilmadhav_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('nilmadhav_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync token & user from localStorage on mount and verify with /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('nilmadhav_token');
      if (storedToken) {
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
          localStorage.setItem('nilmadhav_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Failed to refresh user profile on init', err.message);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen to 401 unauthorized event from apiClient
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('nilmadhav_token');
      localStorage.removeItem('nilmadhav_user');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    setToken(data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    localStorage.setItem('nilmadhav_token', data.token);
    localStorage.setItem(
      'nilmadhav_user',
      JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role })
    );
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    setToken(data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    localStorage.setItem('nilmadhav_token', data.token);
    localStorage.setItem(
      'nilmadhav_user',
      JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role })
    );
    return data;
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nilmadhav_token');
    localStorage.removeItem('nilmadhav_user');
  }, []);

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('nilmadhav_user', JSON.stringify(updated));
      return updated;
    });
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(user && user.role === 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
