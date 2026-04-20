import { MagnifyingGlassIcon, LeafIcon, FireIcon, TrophyIcon } from '@phosphor-icons/react';

export function HeroSection() {
  return (
    <section className="relative w-full py-16 md:py-24 rounded-3xl overflow-hidden mt-6 bg-surface-card border border-slate-100 shadow-xl shadow-slate-200/50">
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto">
        
        {/* Badge superior */}
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-river-light text-river-dark text-sm font-bold mb-6 border border-river-green/20">
          <LeafIcon size={16} weight="bold" />
          Delivery inteligente com foco em saúde
        </span>

        {/* Headline de impacto (Ajustado para ter contraste no branco) */}
        <h1 className="text-4xl md:text-6xl font-black text-surface-text tracking-tight mb-6 leading-tight">
          Sua liberdade para escolher, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-river-dark to-river-green">
            com informação de verdade.
          </span>
        </h1>

        <p className="text-surface-muted text-lg md:text-xl mb-10 max-w-2xl">
          Revolucionamos o delivery trazendo transparência nutricional imediata para cada prato do cardápio com o nosso sistema NutriScore.
        </p>

        {/* Barra de Busca Gigante */}
        <div className="w-full relative flex items-center mb-8 shadow-sm group">
          <input 
            type="text" 
            placeholder="O que vamos comer de forma inteligente hoje?" 
            className="w-full h-16 bg-surface-bg border-2 border-slate-200 rounded-2xl pl-14 pr-32 text-surface-text placeholder:text-surface-muted focus:outline-none focus:border-river-green focus:bg-surface-card transition-all text-lg"
          />
          <MagnifyingGlassIcon size={28} className="absolute left-5 text-surface-muted group-focus-within:text-river-green transition-colors" />
          <button className="absolute right-2 h-12 px-6 bg-river-green hover:bg-river-dark text-white font-bold rounded-xl transition-colors shadow-md shadow-river-green/30">
            Buscar
          </button>
        </div>

        {/* Filtros Rápidos (Pills) */}
        <div className="flex flex-wrap justify-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-bg border border-slate-200 hover:border-score-A hover:text-score-A hover:bg-surface-card text-surface-text transition-all text-sm font-medium shadow-sm">
            <TrophyIcon size={16} /> Top HealthScore
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-bg border border-slate-200 hover:border-score-E hover:text-score-E hover:bg-surface-card text-surface-text transition-all text-sm font-medium shadow-sm">
            <FireIcon size={16} /> Promoções do Dia
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-bg border border-slate-200 hover:border-river-green hover:text-river-green hover:bg-surface-card text-surface-text transition-all text-sm font-medium shadow-sm">
            <LeafIcon size={16} /> Opções Veganas
          </button>
        </div>

      </div>
    </section>
  );
}