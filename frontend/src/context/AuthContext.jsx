import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lms_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('lms_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data.user);
          localStorage.setItem('lms_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('[Auth Init Error]', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const { token: authToken, user: authUser, message } = res.data;

      localStorage.setItem('lms_token', authToken);
      localStorage.setItem('lms_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      toast.success(message || 'Logged in successfully!');
      return authUser;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      const { token: authToken, user: authUser, message } = res.data;

      localStorage.setItem('lms_token', authToken);
      localStorage.setItem('lms_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      toast.success(message || 'Account registered successfully!');
      return authUser;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data.user);
      localStorage.setItem('lms_user', JSON.stringify(res.data.user));
    } catch (err) {
      console.error('[Refresh User Error]', err);
    }
  };

  const isRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isRole,
        isAuthenticated: !!token && !!user,
        isEmployee: user?.role === 'employee',
        isManager: user?.role === 'manager',
        isAdmin: user?.role === 'admin',
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
