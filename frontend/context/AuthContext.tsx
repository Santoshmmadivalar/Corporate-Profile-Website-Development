'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import { User, APIResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<APIResponse<{ token: string; user: User }>>;
  register: (data: any) => Promise<APIResponse<{ token: string; user: User }>>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          // Verify token and fetch profile
          const response = await api.get<APIResponse<User>>('/auth/me');
          if (response.data.success) {
            setUser(response.data.data);
          } else {
            // Token expired or invalid
            logout();
          }
        }
      } catch (error) {
        console.error('Failed to authenticate token:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post<APIResponse<{ token: string; user: User }>>('/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        const { token: userToken, user: userData } = response.data.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
      }
      return response.data;
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: error.message || 'An error occurred during login' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const response = await api.post<APIResponse<{ token: string; user: User }>>('/auth/register', userData);
      if (response.data.success) {
        const { token: userToken, user: uData } = response.data.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(uData);
      }
      return response.data;
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data) {
        return error.response.data;
      }
      return { success: false, message: error.message || 'An error occurred during registration' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = async (userToken: string) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    try {
      const response = await api.get<APIResponse<User>>('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to login with token:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithToken, logout }}>
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
