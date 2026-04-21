// src/components/AdminLayout.tsx
import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/useAuthStore';
import { List } from '@phosphor-icons/react'; // Ícone de Menu Hambúrguer

export function AdminLayout() {
  const isLogged = useAuthStore((state) => state.isLogged);
  
  // Estado para controlar a gaveta no mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isLogged) {
    return <Navigate to="/restaurante/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-surface-bg font-sans relative">
      
      {/* OVERLAY ESCURO: Aparece no mobile quando o menu está aberto. 
          Se clicar nele, fecha a barra lateral. */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR: Passamos o estado e a função de fechar como props */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* ÁREA PRINCIPAL DA TELA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER MOBILE: Só é visível em telas menores que 'lg' (1024px) */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 shadow-sm z-30 sticky top-0">
          <div className="flex items-center gap-1 font-black text-xl text-river-dark tracking-tight">
            <span className="text-river-green">RIVER</span>FOOD
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-surface-muted hover:text-river-dark hover:bg-slate-50 rounded-xl transition-colors"
          >
            <List size={24} weight="bold" />
          </button>
        </header>

        {/* CONTEÚDO (OUTLET) */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}