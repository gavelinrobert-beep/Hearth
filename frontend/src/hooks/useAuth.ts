import { useCallback } from 'react';
import { useAuthStore, User } from '../services/authStore';
import api from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  username: string;
}

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export function useAuth(): UseAuthReturn {
  const { user, token, setAuth, logout: clearAuth } = useAuthStore();

  const isAuthenticated = !!user && !!token;

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, token } = response.data;
      
      setAuth(user, token);
      initSocket(token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [setAuth]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      const response = await api.post('/auth/register', credentials);
      const { user, token } = response.data;
      
      setAuth(user, token);
      initSocket(token);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, [setAuth]);

  const logout = useCallback(() => {
    disconnectSocket();
    clearAuth();
  }, [clearAuth]);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (user && token) {
      const updatedUser = { ...user, ...updates };
      setAuth(updatedUser, token);
    }
  }, [user, token, setAuth]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };
}
