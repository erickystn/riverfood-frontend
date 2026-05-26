// src/components/ServerOffline.tsx
import { Plug, ArrowClockwise } from '@phosphor-icons/react';

interface ServerOfflineProps {
  onRetry: () => void;
}

export function ServerOffline({ onRetry }: ServerOfflineProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-score-E/20 blur-2xl rounded-full animate-pulse"></div>
        <div className="w-24 h-24 bg-slate-50 border-4 border-slate-100 text-score-E rounded-full flex items-center justify-center relative z-10 shadow-sm">
          <Plug size={48} weight="fill" />
        </div>
      </div>
      
      <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
        Ops! Perda de Conexão.
      </h2>
      
      <p className="text-slate-500 max-w-md mb-8 leading-relaxed font-medium">
        Não conseguimos nos comunicar com os servidores do RiverFood no momento. Nossos cozinheiros (e desenvolvedores) já estão trabalhando nisso!
      </p>
      
      <button 
        onClick={onRetry} 
        className="bg-river-dark text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-river-green shadow-lg hover:shadow-river-green/30 transition-all flex items-center gap-3 active:scale-95"
      >
        <ArrowClockwise size={22} weight="bold" /> 
        Tentar Novamente
      </button>
    </div>
  );
}