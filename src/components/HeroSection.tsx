import { Leaf } from '@phosphor-icons/react';

export function HeroSection() {
  return (
    // 1. GORDURA EXTERNA: Adicionei max-w-7xl e mx-auto para ele não esticar infinitamente em monitores grandes,
    // e w-[calc(100%-2rem)] para forçar uma margem de segurança no mobile.
    <section className="relative min-h-[450px] w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-7xl mx-auto rounded-[2.5rem] mt-8 overflow-hidden shadow-2xl flex items-center">
      
      {/* Imagem de Fundo */}
      <img 
        src="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1200&auto=format&fit=crop" 
        className="absolute inset-0 w-full h-full object-cover"
        alt="Ingredientes saudáveis frescos"
      />
      
      {/* Overlay Escuro */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>

      {/* 2. GORDURA INTERNA (A SOLUÇÃO): 
          Troquei o 'px-8' por um padding super generoso na esquerda: 
          pl-10 no mobile e pl-20 (ou até pl-24) no desktop. */}
      <div className="relative z-10 pl-10 pr-6 py-12 md:pl-24 md:pr-12 md:py-16 max-w-3xl">
        
        {/* Badge */}
        <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black px-4 py-2 rounded-full w-fit uppercase tracking-widest mb-6 backdrop-blur-sm">
          <Leaf size={16} weight="bold" />
          Saúde em primeiro lugar
        </div>
        
        {/* Título */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
          Alimente seu corpo com <br />
          <span className="text-emerald-400 drop-shadow-md">inteligência nutricional.</span>
        </h1>
        
        {/* Subtítulo */}
        <p className="text-slate-300 text-base md:text-lg max-w-md font-medium leading-relaxed">
          Nós unimos tecnologia e gastronomia. Escolha pratos pelo HealthScore e transforme sua rotina sem abrir mão do sabor.
        </p>
        
      </div>
    </section>
  );
}