// src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  nome: string;
  usuario: string; // Este é o e-mail no seu sistema
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLogged: boolean;
  setLogin: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLogged: false,

      setLogin: (user, token) => set({ 
        user, 
        token, 
        isLogged: true 
      }),

      logout: () => set({ 
        user: null, 
        token: null, 
        isLogged: false 
      }),
    }),
    {
      name: 'riverfood-auth',
    }
  )
);