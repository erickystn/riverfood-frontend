// src/components/AdminLayout.tsx
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/useAuthStore';

export function AdminLayout() {
  const isLogged = useAuthStore((state) => state.isLogged);

  // Regra de Segurança: Se não estiver logado, chuta de volta para o login
  // Isso protege todas as rotas filhas deste layout automaticamente [cite: 129, 137]
  if (!isLogged) {
    return <Navigate to="/restaurante/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-surface-bg font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Aqui entrarão as páginas administrativas */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}