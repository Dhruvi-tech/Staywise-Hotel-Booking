import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getMe, verifyAccountCode } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('staywise_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('staywise_token');
      if (storedToken) {
        try {
          const userData = await getMe();
          setUser(userData);
        } catch (error) {
          console.warn('Invalid or expired session. Logging out.');
          localStorage.removeItem('staywise_token');
          localStorage.removeItem('staywise_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    if (res.token && res.user) {
      localStorage.setItem('staywise_token', res.token);
      localStorage.setItem('staywise_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Authentication failed.');
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    if (res.token && res.user) {
      localStorage.setItem('staywise_token', res.token);
      localStorage.setItem('staywise_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Registration failed.');
  };

  const verifyAccount = async (email, code) => {
    const res = await verifyAccountCode(email, code);
    if (res.token && res.user) {
      localStorage.setItem('staywise_token', res.token);
      localStorage.setItem('staywise_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Verification failed.');
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('staywise_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'hotel_manager' || user?.role === 'admin',
        login,
        register,
        verifyAccount,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
