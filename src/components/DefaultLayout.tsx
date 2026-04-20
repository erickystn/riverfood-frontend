// src/components/DefaultLayout.tsx
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function DefaultLayout() {
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