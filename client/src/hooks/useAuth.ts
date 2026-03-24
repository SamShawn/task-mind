import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authAPI.getMe();
          setUser(userData);
        }
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response;
  };

  const register = async (name: string, email: string, password: string, department?: string) => {
    const response = await authAPI.register({ name, email, password, department });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response;
  };

  const logout = async () => {
    try {
      // 调用服务器端退出API
      await authAPI.logout();
    } catch (error) {
      // 即使服务器端退出失败，仍然清除本地状态
      console.warn('服务器端退出失败，但已清除本地状态:', error);
    } finally {
      // 总是清除本地状态
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return { user, loading, login, register, logout };
};
