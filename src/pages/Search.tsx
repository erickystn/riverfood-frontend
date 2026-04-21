// src/pages/Search.tsx
import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { MagnifyingGlass, Funnel, XCircle } from '@phosphor-icons/react';

export function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('busca') || ''; 
  
  // Estados para dados do banco
  const [produtosBrutos, setProdutosBrutos] = useState<any[]>([]);
  const [categoriasBanco, setCategoriasBanco] = useState<string[]>(["Todos"]);
  
  // Estados de controle da UI
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  // =========================================================================
  // LÓGICA DE SCROLL HORIZONTAL COM O MOUSE (DRAG & WHEEL)
  // =========================================================================
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Transforma o scroll vertical do mouse em horizontal
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  // Anota o ponto de partida quando clica e segura
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  // Cancela o modo de arrastar quando solta o clique ou tira o mouse de cima
  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Move a barra junto com o mouse
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiplicar por 2 deixa o arrasto mais ágil
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  // =========================================================================

  // BUSCA PRIMÁRIA: Busca produtos (pela busca ou todos) e as categorias reais
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Dispara as duas chamadas em paralelo para ganhar performance
        const produtosPromise = query 
          ? api.get(`/produtos/nome/${query}`) 
          : api.get('/produtos/all');
          
        const categoriasPromise = api.get('/categorias/all');

        const [produtosRes, categoriasRes] = await Promise.all([
          produtosPromise, 
          categoriasPromise
        ]);
        
        setProdutosBrutos(Array.isArray(produtosRes.data) ? produtosRes.data : []);
        
        // Mapeia as categorias do seu NestJS para o array de strings do filtro
        if (Array.isArray(categoriasRes.data)) {
          const nomesCategorias = categoriasRes.data.map((cat: any) => cat.descricao);
          setCategoriasBanco(["Todos", ...nomesCategorias]);
        }

      } catch (error) {
        console.error("Erro na busca:", error);
        setProdutosBrutos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [query]);

  // FILTRO SECUNDÁRIO: Filtra os resultados da busca por categoria (no Frontend)
  const produtosFiltrados = useMemo(() => {
    if (categoriaAtiva === "Todos") return produtosBrutos;
    
    return produtosBrutos.filter(produto => {
      const nomeCategoria = produto.categoria?.descricao || "Outros";
      return nomeCategoria.toLowerCase() === categoriaAtiva.toLowerCase();
    });
  }, [produtosBrutos, categoriaAtiva]);

  // Função para resetar tudo e voltar ao cardápio geral
  function limparTudo() {
    setCategoriaAtiva("Todos");
    navigate('/search'); 
  }

  return (
    <div className="py-10 space-y-8 animate-fade-in">
      
      {/* CABEÇALHO E FILTROS */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-river-dark tracking-tight">
            {query ? `Resultados para "${query}"` : "Cardápio Completo"}
          </h1>
          <p className="text-surface-muted font-medium">
            {produtosFiltrados.length} pratos encontrados para sua seleção
          </p>
        </div>
        
        <div className="flex flex-col items-start lg:items-end gap-3 max-w-full overflow-hidden">
          <div className="flex items-center gap-2 text-[10px] font-black text-surface-muted uppercase tracking-widest">
            <Funnel size={14} weight="bold" />
            Filtrar por Categoria
          </div>
          
          {/* CARROSSEL DE CATEGORIAS COM EVENTOS DE MOUSE E REF */}
          <div 
            ref={scrollRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseUpOrLeave}
            onMouseUp={handleMouseUpOrLeave}
            onMouseMove={handleMouseMove}
            className={`
              flex gap-2 overflow-x-auto w-full pb-4 snap-x 
              cursor-grab active:cursor-grabbing select-none
            `}
            style={{ 
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none' /* IE/Edge */
            }}
          >
            {/* Esconde a barra de rolagem no Chrome/Safari inline */}
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>

            {categoriasBanco.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  // O botão só muda de categoria se não for um clique acidental após arrastar
                  if (!isDragging) setCategoriaAtiva(cat);
                }}
                className={`shrink-0 whitespace-nowrap snap-start px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  categoriaAtiva === cat
                    ? 'bg-river-dark text-white shadow-lg shadow-river-dark/20'
                    : 'bg-white text-surface-muted border border-slate-200 hover:border-river-green hover:text-river-green'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL (VITRINE OU LOADING OU ERRO) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-river-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-surface-muted font-bold animate-pulse">Preparando o cardápio...</p>
        </div>
      ) : produtosFiltrados.length === 0 ? (
        
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-slate-100 text-center px-6 shadow-sm">
          <div className="bg-slate-50 p-6 rounded-full mb-6">
            <MagnifyingGlass size={48} className="text-slate-300" weight="duotone" />
          </div>
          <h3 className="text-xl font-black text-river-dark mb-2">Nenhum prato encontrado</h3>
          <p className="text-surface-muted mb-8 max-w-sm">
            Não encontramos resultados para sua busca atual. Tente mudar os filtros ou o termo pesquisado.
          </p>
          <button 
            onClick={limparTudo}
            className="flex items-center gap-2 bg-river-green hover:bg-emerald-500 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-river-green/20 active:scale-95"
          >
            <XCircle size={20} weight="bold" />
            Limpar Busca e Ver Tudo
          </button>
        </div>

      ) : (
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {produtosFiltrados.map((p) => (
            <ProductCard 
              key={p.id}
              {...p} // <--- Isso aqui passa ID, nome, tagsPreparo, usuario, TUDO de uma vez!
            />
          ))}
        </div>

      )}
    </div>
  );
}