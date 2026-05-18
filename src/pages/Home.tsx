// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';
import { Leaf, Sparkle, MagnifyingGlass, Info, Fire } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { getHealthScoreDetails } from '../utils/healthScore';
import { HealthScoreSection } from '../components/HealthScoreSection';

export function Home() {
  const navigate = useNavigate();
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscaExPressa, setBuscaExpressa] = useState('');

  useEffect(() => {
    async function fetchTopHealthy() {
      try {
        const response = await api.get('/produtos/recomendados');
        setTopProducts(response.data.slice(0, 8)); // 8 para manter 2 linhas fechadas
      } catch (error) {
        console.error("Erro ao carregar recomendados", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopHealthy();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (buscaExPressa.trim()) {
      navigate(`/search?busca=${encodeURIComponent(buscaExPressa)}`);
    }
  };

  return (
    <div className="pb-16 space-y-16 animate-fade-in">
      
      {/* 1. HERO COMPACTO & CONVERSIVO */}
      <section className="bg-river-dark rounded-[3rem] p-10 md:p-14 relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-river-light/20 text-river-green px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm border border-river-green/20">
            <Leaf size={16} weight="bold" />
            O Delivery que Cuida de Você
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Transparência total no seu prato.
          </h1>
          
          <p className="text-slate-300 font-medium text-lg">
            Da salada in-natura ao hambúrguer do fim de semana, você decide o que comer com base no nosso exclusivo HealthScore (A ao E).
          </p>

          {/* Barra de Busca Expressa que redireciona pro /search */}
          <form onSubmit={handleSearch} className="flex bg-white p-2 rounded-full shadow-lg mx-auto max-w-lg mt-8 transition-all focus-within:ring-4 focus-within:ring-river-green/30">
            <div className="flex-1 flex items-center px-4">
              <MagnifyingGlass size={20} className="text-slate-400" />
              <input 
                type="text" 
                value={buscaExPressa}
                onChange={(e) => setBuscaExpressa(e.target.value)}
                placeholder="O que você quer comer hoje?" 
                className="w-full bg-transparent outline-none text-slate-800 font-medium px-3 placeholder:text-slate-400"
              />
            </div>
            <button type="submit" className="bg-river-green text-river-dark font-black px-6 py-3 rounded-full hover:bg-emerald-500 transition-colors">
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* 2. LEGENDA DO HEALTH SCORE (Disruptivo) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-2 text-river-dark mb-6 justify-center">
          <Info size={24} weight="duotone" className="text-river-green" />
          <h2 className="text-xl font-black tracking-tight">Entenda o RiverScore</h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {[100, 80, 60, 40, 10].map(score => {
            const data = getHealthScoreDetails(score);
            return (
              <div key={data.letter} className="flex items-center gap-3 bg-surface-card px-5 py-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-help group" title={data.description}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${data.color} ${data.textColor}`}>
                  {data.letter}
                </div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest group-hover:text-river-dark transition-colors">
                  {data.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. VITRINE DE DESTAQUES */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
              <Sparkle size={28} weight="fill" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-surface-text tracking-tight">
                Top Picks Saudáveis
              </h2>
              <p className="text-sm text-surface-muted">Nossas melhores recomendações (Notas A e B)</p>
            </div>
          </div>
          
          <button onClick={() => navigate('/search')} className="hidden sm:block text-river-green font-black uppercase text-xs tracking-widest hover:text-river-dark transition-colors">
            Ver Cardápio Completo
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-[2.5rem]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 px-2">
            {topProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </section>
      <HealthScoreSection/>

    </div>
  );
}