// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// INTERCEPTOR DE RESPOSTA CORRIGIDO
api.interceptors.response.use(
  (response) => response, 
  (error) => {
    // 1. Verifica se a URL da requisição que falhou continha a palavra '/logar'
    const isLoginRoute = error.config?.url?.includes('/logar');

    // 2. Só expulsa se for erro 401 E NÃO for a rota de login
    if (error.response?.status === 401 && !isLoginRoute) {
      const logout = useAuthStore.getState().logout;
      logout(); 
      
      if (!window.location.pathname.includes('/restaurante/login')) {
        window.location.href = '/restaurante/login';
      }
    }
    
    return Promise.reject(error);
  }
);