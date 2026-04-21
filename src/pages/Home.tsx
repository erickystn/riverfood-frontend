import { useEffect, useState } from 'react';
import { HeroSection } from '../components/HeroSection';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';
import { Leaf, Sparkle } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Search } from './Search';

export function Home() {
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopHealthy() {
      try {
        const response = await api.get('/produtos/recomendados');
        // Pegamos apenas os primeiros 12
        setTopProducts(response.data.slice(0, 12));
      } catch (error) {
        console.error("Erro ao carregar recomendados", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopHealthy();
  }, []);

  return (
    <div className="pb-16 space-y-12">
      <section>
        <Link to="/search">
          <HeroSection />
        </Link>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 bg-river-light text-river-dark rounded-xl">
            <Sparkle size={24} weight="fill" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-surface-text tracking-tight">
              Destaques Saudáveis
            </h2>
            <p className="text-sm text-surface-muted italic">Os melhores HealthScores da nossa cozinha</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topProducts.map((p) => (
              <ProductCard
                key={p.id}
                {...p} // <--- O SEGREDO É ESSE: Passa o objeto completo para o Modal funcionar
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}