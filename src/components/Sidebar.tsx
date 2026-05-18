// src/components/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import {
  SquaresFour,
  Package,
  PlusCircle,
  SignOut,
  Leaf,
  Receipt // 💡 Ícone novo para a aba de Pedidos
} from '@phosphor-icons/react';
import { useAuthStore } from '../store/useAuthStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { pathname } = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  // 💡 Lógica mais inteligente para manter o menu aceso, mesmo em sub-rotas (como /editar)
  const isLinkActive = (path: string) => {
    if (path === '/restaurante/produtos') {
      return pathname === '/restaurante/produtos' || pathname.includes('/editar/');
    }
    return pathname === path;
  };

  const linkClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
    ${isLinkActive(path)
      ? 'bg-river-green text-white shadow-lg shadow-river-green/20'
      : 'text-surface-muted hover:bg-river-light hover:text-river-dark'}
  `;

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-surface-card border-r border-slate-200 flex flex-col h-screen
      transform transition-transform duration-300 ease-in-out
      lg:sticky lg:top-0 lg:translate-x-0 
      ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
    `}>

      {/* Topo: Branding e Voltar */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-river-green p-1.5 rounded-lg text-white">
            <Leaf size={20} weight="fill" />
          </div>
          <span className="text-xl font-black text-river-dark tracking-tight">
            RIVER<span className="text-river-green">FOOD</span>
          </span>
        </div>
        <p className="text-[10px] font-bold text-surface-muted uppercase tracking-[0.2em] ml-1">
          Painel do Parceiro
        </p>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 px-4 flex flex-col gap-2">
        <Link 
          to="/restaurante/dashboard" 
          onClick={onClose} 
          className={linkClass('/restaurante/dashboard')}
        >
          <SquaresFour size={20} weight="bold" />
          Dashboard
        </Link>

        {/* 💡 NOVO: Link para a futura página de Pedidos */}
        <Link 
          to="/restaurante/pedidos" 
          onClick={onClose} 
          className={linkClass('/restaurante/pedidos')}
        >
          <Receipt size={20} weight="bold" />
          Gestão de Pedidos
        </Link>

        <Link 
          to="/restaurante/produtos" 
          onClick={onClose} 
          className={linkClass('/restaurante/produtos')}
        >
          <Package size={20} weight="bold" />
          Meus Produtos
        </Link>

        <Link 
          to="/restaurante/produtos/novo" 
          onClick={onClose} 
          className={linkClass('/restaurante/produtos/novo')}
        >
          <PlusCircle size={20} weight="bold" />
          Novo Prato
        </Link>
      </nav>

      {/* Rodapé da Sidebar: Usuário e Sair */}
      <div className="p-4 border-t border-slate-100">
        
        <Link to="/restaurante/perfil" onClick={onClose}>
          <div className="flex items-center gap-3 px-2 mb-4 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer">
            
            {/* 💡 Lógica de Foto Dinâmica do Restaurante */}
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-river-dark font-bold border-2 border-river-light shrink-0 overflow-hidden">
              {user?.foto ? (
                <img src={user.foto} alt={user.nome} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.nome?.charAt(0)?.toUpperCase() || 'R'}</span>
              )}
            </div>
            
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-surface-text truncate">{user?.nome || 'Restaurante'}</p>
              <p className="text-xs text-surface-muted truncate">{user?.usuario}</p>
            </div>
          </div>
        </Link>

        <button
          onClick={() => {
            onClose(); 
            logout();  
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-score-E hover:bg-score-E/10 rounded-xl transition-colors"
        >
          <SignOut size={20} weight="bold" />
          Sair da Conta
        </button>
      </div>
      
    </aside>
  );
}