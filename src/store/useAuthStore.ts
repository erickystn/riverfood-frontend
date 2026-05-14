// src/store/useAuthStore.ts
import { toast } from 'react-toastify';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Criamos um type para não ter erro de digitação
export type TipoUsuario = 'CLIENTE' | 'RESTAURANTE';

interface User {
  id: number;
  nome: string;
  usuario: string;
  tipo: TipoUsuario; // 2. Adicionamos o tipo aqui!
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

      logout: () => {
        set({
          user: null,
          token: null,
          isLogged: false
        });
        // Notificação global
        toast.info("Sessão encerrada. Volte logo!");
      },
    }),
    {
      name: 'riverfood-auth',
    }
  )
);