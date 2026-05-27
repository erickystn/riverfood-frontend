// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';
import { Leaf, Sparkle, Info, ArrowRight, Fire, Carrot } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { getHealthScoreDetails } from '../utils/healthScore';
import { HealthScoreSection } from '../components/HealthScoreSection';
import { ServerOffline } from '../components/ServerOffline';
import { motion, AnimatePresence } from 'framer-motion'; // 💡 Importamos o Framer Motion

// 💡 DADOS DO SLIDER (O coração da sua nova UX)
const heroSlides = [
  {
    id: 0,
    badge: "O Delivery que Cuida de Você",
    icon: <Leaf size={16} weight="bold" />,
    title: "Transparência total no seu prato.",
    description: "Da salada in-natura ao hambúrguer do fim de semana, você decide o que comer com base no nosso exclusivo HealthScore.",
    ctaText: "Ver Cardápio Completo",
    query: "", // Vazio para mostrar tudo
    bgImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200",
  },
  {
    id: 1,
    badge: "Frescor Diário",
    icon: <Carrot size={16} weight="bold" />,
    title: "O Poder das Folhas Verdes.",
    description: "Saladas orgânicas, crocantes e ricas em nutrientes para um almoço leve e cheio de energia.",
    ctaText: "Explorar Saladas",
    query: "salada",
    bgImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200",
  },
  {
    id: 2,
    badge: "Leveza Oriental",
    icon: <Sparkle size={16} weight="bold" />,
    title: "A arte do Sushi saudável.",
    description: "Peixes frescos, combinados leves e muito sabor. A opção perfeita para não sair da dieta curtindo um bom japonês.",
    ctaText: "Explorar Sushis",
    query: "hot roll", // 💡 Manda buscar direto por "sushi"
    bgImage: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1200", // Foto de combinados de sushi do Unsplash
  }
];

export function Home() {
  const navigate = useNavigate();
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // 💡 ESTADO DO SLIDER
  const [currentSlide, setCurrentSlide] = useState(0);

  // 💡 AUTO-PLAY DO SLIDER (Muda a cada 5 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTopHealthy() {
    try {
      setLoading(true);
      setIsOffline(false);

      const response = await api.get('/produtos/recomendados');
      setTopProducts(response.data.slice(0, 8));
    } catch (error: any) {
      console.error("Erro ao carregar recomendados", error);
      if (!error.response || error.code === 'ERR_NETWORK') {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTopHealthy();
  }, []);

  // 💡 FUNÇÃO DE NAVEGAÇÃO DO CTA
  const handleCtaClick = (query: string) => {
    if (query) {
      navigate(`/search?busca=${encodeURIComponent(query)}`);
    } else {
      navigate('/search');
    }
  };

  if (isOffline) {
    return <ServerOffline onRetry={fetchTopHealthy} />;
  }

  return (
    <div className="pb-16 space-y-16 animate-fade-in">

      {/* 1. HERO SLIDER ANIMADO (Fim da barra de busca redundante!) */}
      <section className="bg-river-dark rounded-[3rem] relative overflow-hidden flex flex-col items-center text-center shadow-2xl min-h-[450px] justify-center">

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 md:p-14"
          >
            {/* Imagem de Fundo Dinâmica */}
            <div
              className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20"
              style={{ backgroundImage: `url(${heroSlides[currentSlide].bgImage})` }}
            />

            {/* Conteúdo */}
            <div className="relative z-10 max-w-2xl mx-auto space-y-4 w-full flex flex-col items-center">

              {/* Badge Menor no mobile */}
              <div className="inline-flex items-center gap-2 bg-river-light/20 text-river-green px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-river-green/20">
                {heroSlides[currentSlide].icon}
                {heroSlides[currentSlide].badge}
              </div>

              {/* Título com ajuste de tamanho para mobile */}
              <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tight drop-shadow-md px-2">
                {heroSlides[currentSlide].title}
              </h1>

              {/* Descrição mais curta no mobile */}
              <p className="text-slate-300 font-medium text-sm md:text-lg max-w-xl px-4 line-clamp-3">
                {heroSlides[currentSlide].description}
              </p>

              {/* Botão com tamanho ajustado */}
              <div className="pt-2">
                <button
                  onClick={() => handleCtaClick(heroSlides[currentSlide].query)}
                  className="bg-river-green text-river-dark font-black px-6 py-3 md:px-8 md:py-4 rounded-full text-sm md:text-base hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg"
                >
                  {heroSlides[currentSlide].ctaText} <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 💡 CONTROLES DO SLIDER (As bolinhas de navegação) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-river-green w-8 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-white/30 hover:bg-white/50 w-2'}`}
              aria-label={`Ir para o slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. LEGENDA DO HEALTH SCORE */}
      <section className="max-w-5xl mx-auto px-4">
        <a href="#entenda">
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
        </a>
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

      <HealthScoreSection />

    </div>
  );
}