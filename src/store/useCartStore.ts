// src/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ProductProps } from '../components/ProductCard';

export interface CartItem extends ProductProps {
  quantidade: number;
}

interface CartStore {
  items: CartItem[];
  // Novos estados para travar o carrinho
  restauranteId: number | null;
  restauranteNome: string | null;
  
  // Modificamos o addItem para retornar um booleano
  // true = adicionou com sucesso / false = tentou adicionar de outro restaurante
  addItem: (product: ProductProps) => boolean;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  // Nova função para quando o usuário aceitar trocar de restaurante
  forceAddItemAndClear: (product: ProductProps) => void; 
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restauranteId: null,
      restauranteNome: null,

      addItem: (product) => {
        const state = get();
        const produtoRestauranteId = product.usuario?.id;
        const produtoRestauranteNome = product.usuario?.nome;

        // REGRA DE NEGÓCIO: Se o carrinho tem itens e o restaurante é diferente, BLOQUEIA!
        if (state.restauranteId !== null && state.restauranteId !== produtoRestauranteId) {
          return false; // Retorna falso para a UI abrir o modal de confirmação
        }

        // Se passou da trava, adiciona normalmente
        const itemExists = state.items.find((item) => item.id === product.id);

        if (itemExists) {
          set({
            items: state.items.map((item) =>
              item.id === product.id ? { ...item, quantidade: item.quantidade + 1 } : item
            ),
          });
        } else {
          set({ 
            items: [...state.items, { ...product, quantidade: 1 }],
            restauranteId: produtoRestauranteId,
            restauranteNome: produtoRestauranteNome
          });
        }
        
        return true; // Sucesso
      },

      forceAddItemAndClear: (product) => {
        // Esvazia tudo e começa um carrinho novo com o novo restaurante
        set({
          items: [{ ...product, quantidade: 1 }],
          restauranteId: product.usuario?.id,
          restauranteNome: product.usuario?.nome
        });
      },

      removeItem: (productId) =>
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== productId);
          // Se o carrinho ficou vazio após remover o item, liberamos o restauranteId
          if (newItems.length === 0) {
            return { items: [], restauranteId: null, restauranteNome: null };
          }
          return { items: newItems };
        }),

      clearCart: () => set({ items: [], restauranteId: null, restauranteNome: null }),
    }),
    {
      name: 'riverfood-cart-storage',
    }
  )
);