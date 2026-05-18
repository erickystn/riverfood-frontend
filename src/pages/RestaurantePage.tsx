// src/pages/RestaurantePage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ArrowLeft, Storefront, Star, Clock, MapPin, Receipt } from '@phosphor-icons/react';
import riverfoodLogo from '../assets/riverfood-logo.png'; 

interface Restaurante {
  id: number;
  nome: string;
  foto: string;
  notaMedia?: number;
  tempoEntrega?: string;
}

export function RestaurantePage() {
  const { id } = useParams<{ id: string }>();
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRestauranteEProdutos() {
      try {
        setLoading(true);
        // 1. Busca os dados do restaurante na rota corrigida
        const resUser = await api.get(`/usuarios/restaurantes/${id}`);
        setRestaurante(resUser.data);

        // 2. Busca os produtos e filtra no front (se o backend já não trouxer filtrado)
        const resProdutos = await api.get('/produtos/all');
        const produtosDoRestaurante = resProdutos.data.filter(
          (p: any) => p.usuario?.id === Number(id)
        );
        
        setProdutos(produtosDoRestaurante);
      } catch (error) {
        console.error("Erro ao carregar cardápio do restaurante", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchRestauranteEProdutos();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-river-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-surface-muted font-bold animate-pulse">Preparando a mesa...</p>
      </div>
    );
  }

  if (!restaurante) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-black text-river-dark mb-4">Restaurante não encontrado</h2>
        <Link to="/" className="text-river-green font-bold hover:underline">
          Voltar para a Home
        </Link>
      </div>
    );
  }

  // Define a imagem uma vez para usar no fundo e no avatar
  const imageSource = restaurante.foto && restaurante.foto.trim() !== "" 
    ? restaurante.foto 
    : riverfoodLogo;

  return (
    <div className="pb-16 animate-fade-in">
      
      {/* 1. HEADER DO RESTAURANTE (Estilo Capa) */}
      <section className="relative bg-river-dark h-64 md:h-80 flex items-end pb-8">
        
        {/* Fundo Desfocado */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url(${imageSource})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-river-dark via-river-dark/80 to-transparent" />

        {/* CORREÇÃO DA SETA: 
          Agora ela é relativa à section inteira, ficando lá no topo, longe do avatar!
        */}
        <Link 
          to="/" 
          className="absolute top-6 left-4 md:left-8 bg-white/10 hover:bg-white/20 backdrop-blur-md p-2 rounded-full text-white transition-colors z-20"
        >
          <ArrowLeft size={24} weight="bold" />
        </Link>

        {/* Container do Avatar e Título */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row md:items-end gap-6">
          
          {/* Avatar do Restaurante */}
         <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-river-dark shadow-2xl bg-white shrink-0">
            <img 
              src={imageSource} 
              alt={restaurante.nome} 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = riverfoodLogo; }}
            />
          </div>

          {/* Info Principal */}
          <div className="flex-1 text-white">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
              {restaurante.nome}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold opacity-90">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star size={18} weight="fill" />
                {/* Dados mantidos em mock de UI conforme concordamos */}
                <span>{restaurante.notaMedia || '4.8'} (200+ avaliações)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={18} />
                <span>{restaurante.tempoEntrega || '30-45 min'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={18} />
                <span>A 2.5 km de distância</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CARDÁPIO */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-river-light/30 text-river-green rounded-xl">
            <Receipt size={24} weight="fill" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-surface-text tracking-tight">
              Cardápio Principal
            </h2>
            <p className="text-sm text-surface-muted">
              {produtos.length} pratos disponíveis
            </p>
          </div>
        </div>

        {produtos.length === 0 ? (
          <div className="text-center py-16 bg-surface-card rounded-3xl border border-slate-100">
            <Storefront size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Nenhum prato cadastrado ainda.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {produtos.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}