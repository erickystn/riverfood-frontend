// src/components/Header.tsx
import { useState, type FormEvent, useEffect } from 'react';
import {
  MagnifyingGlass,
  ShoppingCart,
  User,
  CaretDown,
  Storefront,
  Leaf,
  X,
  SignOut,
  ListDashes,
  UserGearIcon
} from '@phosphor-icons/react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore'; // NOVO: Trazemos o estado de autenticação
import { CartSidebar } from './CartSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

export function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('busca') || '');

  // Pegamos os dados do Zustand
  const { isLogged, user, logout } = useAuthStore();

  // Estados de UI
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(searchParams.get('busca') || '');
  }, [searchParams]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?busca=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(`/search`);
    }
  }

  function handleLogout() {
    logout();
    setIsLoginMenuOpen(false);
    navigate('/'); // Volta pra Home ao deslogar
  }

  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((total, item) => total + item.quantidade, 0);

  // Auxiliar para pegar o primeiro nome
  const firstName = user?.nome.split(' ')[0] || '';

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-surface-card border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* 1. Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-river-green p-1.5 rounded-lg text-white">
              <Leaf size={20} weight="fill" />
            </div>
            <span className="text-xl md:text-2xl font-black text-river-dark tracking-tight">
              RIVER<span className="text-river-green">FOOD</span>
            </span>
          </Link>

          {/* 2. Barra de Busca (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-4 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Busque por pratos, categorias ou tags..."
              className="w-full bg-surface-bg border border-slate-200 rounded-full py-2 pl-5 pr-10 focus:outline-none focus:ring-2 focus:ring-river-green focus:border-transparent transition-all text-sm text-surface-text font-medium"
            />
            <button type="submit" className="absolute right-3 top-2 text-surface-muted hover:text-river-green transition-colors">
              <MagnifyingGlass size={20} weight="bold" />
            </button>
          </form>

          {/* 3. Ações */}
          <div className="flex items-center gap-2 md:gap-6">

            {/* Botão Mobile (Abre o modal, logado ou não) */}
            <button
              onClick={() => setIsLoginMenuOpen(true)}
              className="md:hidden p-2 text-surface-text hover:text-river-green transition-colors flex items-center gap-2"
            >
              {isLogged ? (
                <>
                  <div className="bg-river-light text-river-dark p-1 rounded-full"><User size={20} weight="fill" /></div>
                  <span className="text-sm font-bold text-river-dark">{firstName}</span>
                </>
              ) : (
                <User size={26} weight="bold" />
              )}
            </button>

            {/* Menu Desktop */}
            <div className="relative group hidden md:block">
              <button className="flex items-center gap-2 text-surface-text hover:text-river-green transition-colors">
                <div className={`p-2 rounded-full transition-colors ${isLogged ? 'bg-river-light text-river-dark' : 'bg-surface-bg group-hover:bg-river-light'}`}>
                  <User size={20} weight={isLogged ? "fill" : "bold"} />
                </div>
                <span className={`font-bold text-sm ${isLogged && 'text-river-dark'}`}>
                  {isLogged ? `Olá, ${firstName}` : 'Entrar'}
                </span>
                <CaretDown size={12} weight="bold" className="text-surface-muted" />
              </button>

              {/* Dropdown Desktop */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-card rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 overflow-hidden">
                <div className="p-2 flex flex-col gap-1">

                  {isLogged ? (
                    /* DROPDOWN USUÁRIO LOGADO */
                    <>
                      <div className="px-4 py-3 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                        <p className="text-xs text-surface-muted uppercase tracking-wider font-bold mb-1">Logado como</p>
                        <p className="font-black text-surface-text truncate">{user?.nome}</p>
                        <p className="text-xs text-surface-muted truncate">{user?.usuario}</p>
                      </div>

                      {user?.tipo === 'RESTAURANTE' ? (
                        <Link to="/restaurante/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-surface-text hover:bg-river-light hover:text-river-dark rounded-xl transition-colors font-bold">
                          <Storefront size={18} /> Acessar Painel
                        </Link>
                      ) : (
                        <>
                          <Link to="/perfil" className="flex items-center gap-3 px-4 py-3 text-sm text-surface-text hover:bg-surface-bg hover:text-river-green rounded-xl transition-colors font-bold">
                            <UserGearIcon size={18} /> Meu Perfil
                          </Link>
                          <Link to="/meus-pedidos" className="flex items-center gap-3 px-4 py-3 text-sm text-surface-text hover:bg-surface-bg hover:text-river-green rounded-xl transition-colors font-bold">
                            <ListDashes size={18} /> Meus Pedidos
                          </Link>
                        </>
                      )}

                      <div className="h-px bg-slate-100 my-1 mx-2" />

                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-score-E hover:bg-score-E/10 rounded-xl transition-colors font-bold text-left">
                        <SignOut size={18} /> Sair da conta
                      </button>
                    </>
                  ) : (
                    /* DROPDOWN VISITANTE (Não logado) */
                    <>
                      <Link to="/login?type=cliente" className="flex items-center gap-3 px-4 py-3 text-sm text-surface-text hover:bg-surface-bg hover:text-river-green rounded-xl transition-colors font-bold">
                        <User size={18} />
                        <div>
                          <p>Para Você</p>
                          <p className="text-[10px] text-surface-muted font-normal uppercase tracking-wider">Fazer pedido</p>
                        </div>
                      </Link>
                      <div className="h-px bg-slate-100 my-1 mx-2" />
                      <Link to="/login?type=restaurante" className="flex items-center gap-3 px-4 py-3 text-sm text-surface-text hover:bg-river-light hover:text-river-dark rounded-xl transition-colors font-bold">
                        <Storefront size={18} />
                        <div>
                          <p>Para Restaurantes</p>
                          <p className="text-[10px] text-surface-muted font-normal uppercase tracking-wider">Acessar painel</p>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Carrinho (Só mostramos na Home/Vitrine para Clientes) */}
            {(!isLogged || user?.tipo === 'CLIENTE') && (
              <button onClick={() => setIsCartOpen(true)} className="relative text-surface-text hover:text-river-green transition-colors p-2">
                <ShoppingCart size={28} weight="fill" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface-card animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 4. MODAL MOBILE (Dinâmico) */}
      <AnimatePresence>
        {isLoginMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLoginMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-8 z-[110] md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-800">
                  {isLogged ? `Olá, ${firstName}!` : 'Como deseja entrar?'}
                </h3>
                <button onClick={() => setIsLoginMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                  <X size={20} weight="bold" />
                </button>
              </div>

              <div className="grid gap-4">
                {isLogged ? (
                  /* OPÇÕES MOBILE LOGADO */
                  <>
                    <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 mb-2">
                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Perfil atual</p>
                      <p className="font-black text-slate-800">{user?.nome}</p>
                      <p className="text-sm text-slate-500">{user?.usuario}</p>
                    </div>

                    {user?.tipo === 'RESTAURANTE' ? (
                      <Link
                        to="/restaurante/dashboard"
                        onClick={() => setIsLoginMenuOpen(false)}
                        className="flex items-center justify-center gap-2 p-4 bg-river-dark text-white font-bold rounded-xl transition-colors"
                      >
                        <Storefront size={20} /> Acessar Meu Painel
                      </Link>
                    ) : (
                      <>
                        <Link to="/perfil" onClick={() => { setIsLoginMenuOpen(false); }}
                          className="flex items-center justify-center gap-2 p-4 bg-river-green text-white font-bold rounded-xl transition-colors">
                          <UserGearIcon size={18} /> Meu Perfil
                        </Link>
                        <Link
                          to="/meus-pedidos"
                          onClick={() => { setIsLoginMenuOpen(false); }}
                          className="flex items-center justify-center gap-2 p-4 bg-river-green text-white font-bold rounded-xl transition-colors"
                        >
                          <ListDashes size={20} /> Meus Pedidos
                        </Link>
                      </>)}

                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 p-4 border border-rose-200 text-rose-500 hover:bg-rose-50 font-bold rounded-xl transition-colors mt-2"
                    >
                      <SignOut size={20} /> Sair da conta
                    </button>
                  </>
                ) : (
                  /* OPÇÕES MOBILE VISITANTE */
                  <>
                    <Link
                      to="/login?type=cliente"
                      onClick={() => setIsLoginMenuOpen(false)}
                      className="flex items-center gap-4 p-5 bg-river-green/5 border-2 border-river-green/20 rounded-2xl hover:bg-river-green/10 transition-colors"
                    >
                      <div className="bg-river-green p-3 rounded-xl text-white">
                        <User size={24} weight="bold" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-slate-800">Sou Cliente</p>
                        <p className="text-xs text-slate-500 font-medium italic">Quero comer de forma saudável</p>
                      </div>
                    </Link>

                    <Link
                      to="/login?type=restaurante"
                      onClick={() => setIsLoginMenuOpen(false)}
                      className="flex items-center gap-4 p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="bg-slate-800 p-3 rounded-xl text-white">
                        <Storefront size={24} weight="bold" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-slate-800">Sou Restaurante</p>
                        <p className="text-xs text-slate-500 font-medium italic">Gerenciar meus pratos e pedidos</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}