// src/pages/NotFound.tsx
import { useNavigate } from 'react-router-dom';
import { House, WarningCircle, ArrowLeft } from '@phosphor-icons/react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col items-center justify-center p-6 text-center">
      {/* Círculo de Alerta com Identidade Visual */}
      <div className="w-24 h-24 bg-river-light text-river-dark rounded-full flex items-center justify-center mb-8 shadow-lg shadow-river-light/20">
        <WarningCircle size={48} weight="fill" />
      </div>

      <h1 className="text-4xl font-black text-river-dark mb-4 tracking-tight">
        OPS! CAMINHO <span className="text-river-green">NÃO ENCONTRADO</span>
      </h1>
      
      <p className="text-surface-muted max-w-md mb-10 leading-relaxed">
        Parece que este prato não está no nosso cardápio. A página que você está procurando pode ter sido movida ou não existe mais.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 text-surface-muted font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
        >
          <ArrowLeft size={20} weight="bold" />
          Voltar
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-river-dark text-white font-black rounded-2xl hover:bg-river-green transition-all shadow-xl shadow-river-dark/10 active:scale-95"
        >
          <House size={20} weight="bold" />
          Ir para o Início
        </button>
      </div>

      {/* Marca d'água sutil */}
      <div className="mt-20 opacity-10 flex items-center gap-1 font-black text-2xl text-river-dark grayscale">
        RIVER<span className="text-river-green">FOOD</span>
      </div>
    </div>
  );
}