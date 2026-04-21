// src/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ProductProps } from '../components/ProductCard';

// 1. Tipamos o que é um item dentro do carrinho (Produto + Quantidade)
export interface CartItem extends ProductProps {
  quantidade: number;
}

// 2. Tipamos as ações que a nossa "loja" pode fazer
interface CartStore {
  items: CartItem[];
  addItem: (product: ProductProps) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

// 3. Criamos o Hook global com a mágica do Zustand + Persistência
export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [], // O carrinho começa vazio

      addItem: (product) => 
        set((state) => {
          // Verifica se o prato já está no carrinho
          const itemExists = state.items.find((item) => item.id === product.id);

          if (itemExists) {
            // Se já existe, apenas aumenta a quantidade
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantidade: item.quantidade + 1 }
                  : item
              ),
            };
          }

          // Se é a primeira vez, adiciona o prato com quantidade 1
          return { items: [...state.items, { ...product, quantidade: 1 }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'riverfood-cart-storage', // Nome do "arquivo" salvo no navegador
    }
  )
);