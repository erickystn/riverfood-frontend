// src/components/CartSidebar.tsx
import { useNavigate } from 'react-router-dom'; // Importamos o navegador
import { X, Trash, ShoppingBag, ArrowRight } from '@phosphor-icons/react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore'; // Para checar se está logado
import { toast } from 'react-toastify';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const navigate = useNavigate();
  const { isLogged } = useAuthStore();
  const { items, removeItem, clearCart } = useCartStore();

  const total = items.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  function handleGoToCheckout() {
    onClose(); // Fecha a barra lateral primeiro
    
    if (!isLogged) {
      toast.info("Quase lá! Entre na sua conta para finalizar o pedido.");
      navigate('/login?type=cliente');
      return;
    }

    navigate('/checkout'); // Se estiver logado, vai para o "irmão maior"
  }

  return (
    <>
      {/* Overlay e Sidebar mantidos... */}
      {isOpen && (
        <div className="fixed inset-0 bg-surface-text/20 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface-bg shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-surface-card">
          <div className="flex items-center gap-2">
            <ShoppingBag size={24} className="text-river-green" weight="bold" />
            <h2 className="text-xl font-bold text-surface-text">Seu Pedido</h2>
          </div>
          <button onClick={onClose} className="p-2 text-surface-muted hover:text-score-E hover:bg-score-E/10 rounded-full transition-colors">
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-surface-muted gap-4 opacity-70">
              <ShoppingBag size={64} weight="thin" />
              <p className="text-lg text-center">Sua sacola de saúde <br/> está vazia.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-surface-card p-4 rounded-2xl border border-slate-100 shadow-sm items-center group animate-fade-in">
                {item.imgUrl ? (
                  <img src={item.imgUrl} alt={item.nome} className="w-16 h-16 object-cover rounded-xl" />
                ) : (
                  <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-[10px] text-surface-muted font-bold uppercase">Sem foto</div>
                )}
                
                <div className="flex-1">
                  <h4 className="font-bold text-surface-text text-sm line-clamp-1">{item.nome}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-surface-muted font-bold">
                      {item.quantidade}x R$ {item.preco.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="font-black text-river-dark">
                      R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <button onClick={() => removeItem(item.id)} className="p-2 text-surface-muted hover:text-score-E transition-colors opacity-0 group-hover:opacity-100">
                  <Trash size={20} weight="fill" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        {items.length > 0 && (
          <div className="p-6 bg-surface-card border-t border-slate-200">
            <div className="flex justify-between mb-6 items-center">
              <span className="font-bold text-surface-muted">Subtotal</span>
              <span className="font-black text-2xl text-river-dark">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            
            <button 
              onClick={handleGoToCheckout}
              className="w-full bg-river-green hover:bg-river-dark text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-river-green/30 flex items-center justify-center gap-2 group"
            >
              Finalizar Pedido
              <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button onClick={clearCart} className="w-full text-center mt-4 text-xs text-surface-muted hover:text-score-E transition-colors font-bold uppercase tracking-widest">
              Limpar Sacola
            </button>
          </div>
        )}
      </div>
    </>
  );
}