// src/store/useAuthStore.ts
import { toast } from 'react-toastify';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 💡 1. Adicionado 'ENTREGADOR' para alinhar com o nosso novo banco de dados
export type TipoUsuario = 'CLIENTE' | 'RESTAURANTE' | 'ENTREGADOR';

interface User {
  id: number;
  nome: string;
  usuario: string;
  tipo: TipoUsuario; 
  foto?: string; // 💡 2. Adicionado a propriedade opcional para a Sidebar ler a imagem sem reclamar!
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