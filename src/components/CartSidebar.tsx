// src/components/CartSidebar.tsx
import { X, Trash, ShoppingBag } from '@phosphor-icons/react';
import { useCartStore } from '../store/useCartStore';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  // Puxando tudo o que precisamos do nosso "cérebro" global
  const { items, removeItem, clearCart } = useCartStore();

  // Cálculo do total: (preço do item * quantidade)
  const total = items.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  return (
    <>
      {/* Overlay (O fundo embaçado/escuro atrás do carrinho) */}
      {/* Usamos backdrop-blur para dar aquele toque de "vidro" da Apple (Glassmorphism) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-surface-text/20 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* A Barra Lateral em si */}
      {/* A mágica do deslize está no "translate-x-0" (aberto) vs "translate-x-full" (fechado) */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface-bg shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabeçalho do Carrinho */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-surface-card">
          <div className="flex items-center gap-2">
            <ShoppingBag size={24} className="text-river-green" weight="bold" />
            <h2 className="text-xl font-bold text-surface-text">Seu Pedido</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-surface-muted hover:text-score-E hover:bg-score-E/10 rounded-full transition-colors"
            title="Fechar carrinho"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Lista de Itens (A área que rola se tiver muita comida) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {items.length === 0 ? (
            // Estado de carrinho vazio (Empty State)
            <div className="flex flex-col items-center justify-center h-full text-surface-muted gap-4 opacity-70">
              <ShoppingBag size={64} weight="thin" />
              <p className="text-lg">O seu carrinho está vazio.</p>
              <button 
                onClick={onClose}
                className="mt-2 text-river-green font-semibold hover:text-river-dark transition-colors"
              >
                Voltar a olhar o cardápio
              </button>
            </div>
          ) : (
            // Mapeando os itens adicionados
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-surface-card p-4 rounded-2xl border border-slate-100 shadow-sm items-center group">
                
                {/* Imagem em miniatura */}
                {item.imgUrl ? (
                  <img src={item.imgUrl} alt={item.nome} className="w-16 h-16 object-cover rounded-xl" />
                ) : (
                  <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-surface-muted">Sem foto</div>
                )}
                
                {/* Dados do Item */}
                <div className="flex-1">
                  <h4 className="font-bold text-surface-text text-sm line-clamp-1" title={item.nome}>{item.nome}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-surface-muted font-medium">
                      {item.quantidade}x R$ {item.preco.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="font-bold text-river-dark">
                      R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Botão de Remover */}
                <button 
                  onClick={() => removeItem(item.id)} 
                  className="p-2 text-surface-muted hover:text-score-E hover:bg-score-E/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  title="Remover prato"
                >
                  <Trash size={20} weight="fill" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Rodapé do Carrinho (Resumo e Checkout) - Só aparece se houver itens */}
        {items.length > 0 && (
          <div className="p-6 bg-surface-card border-t border-slate-200">
            <div className="flex justify-between mb-6 text-surface-text items-center">
              <span className="font-medium text-lg">Total</span>
              <span className="font-black text-2xl text-river-dark">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            
            <button className="w-full bg-river-green hover:bg-river-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-river-green/30 active:scale-[0.98]">
              Finalizar Pedido
            </button>
            
            <button 
              onClick={clearCart} 
              className="w-full text-center mt-4 text-sm text-surface-muted hover:text-score-E transition-colors font-medium"
            >
              Esvaziar carrinho
            </button>
          </div>
        )}
      </div>
    </>
  );
}