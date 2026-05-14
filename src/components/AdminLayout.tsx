// src/components/AdminLayout.tsx
import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/useAuthStore';
import { List } from '@phosphor-icons/react';

export function AdminLayout() {
  // Pegamos o estado de login E os dados do usuário
  const { isLogged, user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // REGRA 1: Não está logado de jeito nenhum? Vai pra porta da frente.
  if (!isLogged) {
    return <Navigate to="/login?type=restaurante" replace />;
  }

  // REGRA 2: A BLINDAGEM MÁXIMA (Controle de Acesso Baseado em Papel)
  // Está logado, mas o tipo não é RESTAURANTE? Expulsa para a Home.
  if (user?.tipo !== 'RESTAURANTE') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-surface-bg font-sans relative">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
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

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}