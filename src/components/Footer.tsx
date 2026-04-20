export function Footer() {
  return (
    <footer className="bg-surface-card border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
        
        {/* Branding e Missão */}
        <div className="text-center md:text-left flex flex-col gap-2">
          <span className="text-xl font-black text-river-dark tracking-tight">
            RIVER<span className="text-river-green">FOOD</span>
          </span>
          <p className="text-surface-muted text-sm max-w-xs">
            Não é só um delivery. É tecnologia para sua saúde e transparência em cada refeição.
          </p>
        </div>

        {/* Links Úteis (Mock para estrutura) */}
        <div className="flex gap-8 text-sm text-surface-muted">
          <a href="#" className="hover:text-river-green transition-colors">Termos</a>
          <a href="#" className="hover:text-river-green transition-colors">Privacidade</a>
          <a href="#" className="hover:text-river-green transition-colors">Para Restaurantes</a>
        </div>

      </div>
      
      {/* Copyright */}
      <div className="border-t border-slate-100 py-4 text-center">
        <p className="text-surface-muted text-xs">
          &copy; {new Date().getFullYear()} River Food. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}