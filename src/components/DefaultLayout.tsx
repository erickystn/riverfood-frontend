// src/components/DefaultLayout.tsx
import { Outlet, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuthStore } from '../store/useAuthStore';

export function DefaultLayout() {
  const { isLogged, user } = useAuthStore();

  // O "GUARDA DE TRÂNSITO" DA VITRINE
  // Se um restaurante tentar passear pela área de clientes, empurramos ele para o Dashboard
  if (isLogged && user?.tipo === 'RESTAURANTE') {
    return <Navigate to="/restaurante/dashboard" replace />;
  }

  return (
    // O flex-col com min-h-screen empurra o footer para baixo
    <div className="min-h-screen flex flex-col bg-surface-bg font-sans">
      <Header />
      
      {/* O flex-1 faz com que o main ocupe todo o espaço disponível */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}