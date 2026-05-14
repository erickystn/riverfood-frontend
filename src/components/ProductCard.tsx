// src/components/ProductCard.tsx
import { useState } from 'react';
import { ShoppingCart, WarningCircle, Check, X } from '@phosphor-icons/react';
import { useCartStore } from '../store/useCartStore';
import { TagHealthScore } from './TagHealthScore';
import { ProductModal } from './ProductModal'; // Importando o seu modal!
import { toast } from 'react-toastify';
import foodPlaceholder from '../assets/riverfood-logo.png';

export interface ProductProps {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imgUrl: string;
  tagsPreparo: string[];
  healthScore: number;
  usuario?: {
    id: number;
    nome: string;
  };
}

export function ProductCard(props: ProductProps) {
  const { nome, descricao, preco, imgUrl, healthScore, usuario } = props;
  
  const addItem = useCartStore((state) => state.addItem);
  const forceAddItemAndClear = useCartStore((state) => state.forceAddItemAndClear);
  const cartRestauranteNome = useCartStore((state) => state.restauranteNome);

  // Agora temos DOIS estados para controlar as janelas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

  // Atualizamos a função para receber o evento do clique
  function handleAddToCart(e?: React.MouseEvent) {
    if (e) e.stopPropagation(); // Evita que o clique no carrinho abra o Modal de Detalhes junto

    const added = addItem(props);
    
    if (added) {
      toast.success(`${nome} adicionado ao carrinho!`);
      setIsModalOpen(false); // Se o modal de detalhes estiver aberto, fecha ele
    } else {
      // Bloqueou! Fecha os detalhes e mostra o aviso.
      setIsModalOpen(false); 
      setShowConflictModal(true);
    }
  }

  function handleConfirmChangeRestaurant() {
    forceAddItemAndClear(props);
    setShowConflictModal(false);
    toast.success(`Carrinho atualizado com prato do ${usuario?.nome || 'novo restaurante'}!`);
  }

  const imageSource = props.imgUrl && props.imgUrl.trim() !== "" 
    ? props.imgUrl 
    : foodPlaceholder;

  return (
    <>
      {/* O Card inteiro agora é clicável para abrir os detalhes */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer bg-surface-card rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative group"
      >
        <div className="relative h-48 overflow-hidden bg-slate-50">
          <img 
          src={imageSource} // <--- Usamos a variável tratada
          alt={nome} 
          onError={(e) => { (e.target as HTMLImageElement).src = foodPlaceholder }} // Safe-guard extra!
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
          <div className="absolute top-4 right-4">
            <TagHealthScore score={healthScore >= 80 ? 'A' : healthScore >= 60 ? 'B' : 'C'} />
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="mb-2">
            <h3 className="text-lg font-black text-surface-text leading-tight mb-1">{nome}</h3>
            <p className="text-xs font-bold text-river-green uppercase tracking-wider truncate">
              {usuario?.nome || 'Parceiro RiverFood'}
            </p>
          </div>
          
          <p className="text-sm text-surface-muted line-clamp-2 mb-4 flex-1">
            {descricao}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
            <span className="text-xl font-black text-river-dark">
              R$ {Number(preco).toFixed(2).replace('.', ',')}
            </span>
            
            {/* O Botão de Carrinho Rápido */}
            <button 
              onClick={handleAddToCart}
              className="bg-river-light text-river-dark hover:bg-river-green hover:text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              <ShoppingCart size={20} weight="fill" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. O SEU MODAL DE DETALHES INTACTO */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={props}
        onAddToCart={handleAddToCart} // Passamos a nossa nova função pra ele!
      />

      {/* 2. O MODAL DE CONFLITO */}
      {showConflictModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowConflictModal(false)}
          ></div>
          
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full relative z-10 shadow-2xl animate-fade-in text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <WarningCircle size={32} weight="fill" />
            </div>
            
            <h3 className="text-2xl font-black text-slate-800 mb-2">Novo Restaurante?</h3>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              Você já tem itens de <strong className="text-slate-700">{cartRestauranteNome}</strong> no seu carrinho. Deseja iniciar um novo pedido em <strong className="text-river-green">{usuario?.nome}</strong>?
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirmChangeRestaurant}
                className="w-full bg-river-dark hover:bg-river-green text-white font-black py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Check size={20} weight="bold" />
                Sim, trocar restaurante
              </button>
              <button 
                onClick={() => setShowConflictModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <X size={20} weight="bold" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}