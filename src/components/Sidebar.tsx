// src/components/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import {
  SquaresFour,
  Package,
  PlusCircle,
  UserCircle,
  SignOut,
  ArrowLeft,
  Leaf
} from '@phosphor-icons/react';
import { useAuthStore } from '../store/useAuthStore';

export function Sidebar() {
  const { pathname } = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  // Estilo comum para os links do menu
  const linkClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
    ${pathname === path
      ? 'bg-river-green text-white shadow-lg shadow-river-green/20'
      : 'text-surface-muted hover:bg-river-light hover:text-river-dark'}
  `;

  return (
    <aside className="w-64 bg-surface-card border-r border-slate-200 flex flex-col h-screen sticky top-0">

      {/* Topo: Branding e Voltar */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 text-river-dark hover:text-river-green transition-colors mb-8 group">
          <ArrowLeft size={18} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-wider">Voltar ao App</span>
        </Link>

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
        <Link to="/restaurante/dashboard" className={linkClass('/restaurante/dashboard')}>
          <SquaresFour size={20} weight="bold" />
          Dashboard
        </Link>

        <Link to="/restaurante/produtos" className={linkClass('/restaurante/produtos')}>
          <Package size={20} weight="bold" />
          Meus Produtos
        </Link>

        <Link to="/restaurante/produtos/novo" className={linkClass('/restaurante/produtos/novo')}>
          <PlusCircle size={20} weight="bold" />
          Novo Prato
        </Link>
      </nav>

      {/* Rodapé da Sidebar: Usuário e Sair */}

      <div className="p-4 border-t border-slate-100">

        <Link to="/restaurante/perfil">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-river-dark font-bold border-2 border-river-light">
              {user?.nome?.charAt(0) || 'R'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-surface-text truncate">{user?.nome || 'Restaurante'}</p>
              <p className="text-xs text-surface-muted truncate">{user?.usuario}</p>
            </div>
          </div>
        </Link>


        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-score-E hover:bg-score-E/10 rounded-xl transition-colors"
        >
          <SignOut size={20} weight="bold" />
          Sair da Conta
        </button>
      </div>
    </aside>
  );
}