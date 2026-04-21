// src/components/Header.tsx
import { useState, type FormEvent, useEffect } from 'react';
import { MagnifyingGlass, ShoppingCart, User, CaretDown, Storefront } from '@phosphor-icons/react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { CartSidebar } from './CartSidebar';

export function Header() {
  // 1. Estados e Hooks da Busca
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('busca') || '');

  // Sincroniza o input com a URL (caso o usuário volte a página ou dê F5)
  useEffect(() => {
    setSearchTerm(searchParams.get('busca') || '');
  }, [searchParams]);

  // Função que dispara quando o usuário aperta Enter ou clica na lupa
  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?busca=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(`/search`); // Se buscar vazio, manda pra página mostrando tudo
    }
  }

  // 2. Estados e Hooks do Carrinho
  const [isCartOpen, setIsCartOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((total, item) => total + item.quantidade, 0);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-surface-card border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* 1. Logo */}
          <Link to="/" className="flex items-center gap-1">
            <span className="text-2xl font-black text-river-dark tracking-tight">
              RIVER<span className="text-river-green">FOOD</span>
            </span>
          </Link>

          {/* 2. Barra de Busca (Desktop) - AGORA É UM FORMULÁRIO */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Busque por pratos saudáveis, categorias ou tags..."
              className="w-full bg-surface-bg border border-slate-200 rounded-full py-2 pl-5 pr-10 focus:outline-none focus:ring-2 focus:ring-river-green focus:border-transparent transition-all text-sm text-surface-text"
            />
            <button 
              type="submit" 
              className="absolute right-3 top-2 text-surface-muted hover:text-river-green transition-colors"
            >
              <MagnifyingGlass size={20} weight="bold" />
            </button>
          </form>

          {/* 3. Ações do Usuário e Carrinho */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Dropdown de Login (Invisível no mobile para simplificar, visível no Desktop) */}
            <div className="relative group hidden md:block">
              <button className="flex items-center gap-2 text-surface-text hover:text-river-green transition-colors">
                <div className="bg-surface-bg p-2 rounded-full group-hover:bg-river-light transition-colors">
                  <User size={20} weight="bold" />
                </div>
                <span className="font-medium text-sm">Entrar</span>
                <CaretDown size={12} weight="bold" className="text-surface-muted" />
              </button>

              {/* O Menu Suspenso */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-card rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                <div className="p-2 flex flex-col gap-1">
                  
                  {/* Link do Consumidor */}
                  <Link 
                    to="/login-cliente" 
                    className="flex items-center gap-3 px-4 py-3 text-sm text-surface-text hover:bg-surface-bg hover:text-river-green rounded-xl transition-colors font-medium"
                  >
                    <User size={18} />
                    <div>
                      <p>Para Você</p>
                      <p className="text-xs text-surface-muted font-normal">Faça seu pedido</p>
                    </div>
                  </Link>

                  <div className="h-px bg-slate-100 my-1 mx-2"></div>

                  {/* Link do Restaurante */}
                  <Link 
                    to="/restaurante/login" 
                    className="flex items-center gap-3 px-4 py-3 text-sm text-surface-text hover:bg-river-light hover:text-river-dark rounded-xl transition-colors font-medium"
                  >
                    <Storefront size={18} />
                    <div>
                      <p>Para Restaurantes</p>
                      <p className="text-xs text-surface-muted font-normal">Acesse seu painel</p>
                    </div>
                  </Link>
                  
                </div>
              </div>
            </div>
            
            {/* Botão do Carrinho */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-surface-text hover:text-river-green transition-colors p-2"
            >
              <ShoppingCart size={24} weight="fill" />
              {/* Badge Dinâmica: só aparece se tiver mais de 0 itens */}
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-score-E text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-surface-card animate-fade-in">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* 4. Renderização da Barra Lateral do Carrinho (Fica fora da tag <header>) */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
}