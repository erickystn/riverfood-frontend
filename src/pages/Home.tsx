// src/pages/Home.tsx
import { useState } from 'react';
import { HeroSection } from '../components/HeroSection';
import { ProductCard, type ProductProps } from '../components/ProductCard';

// 1. As categorias do nosso sistema
const categorias = ["Todos", "Saudáveis", "Lanches", "Bebidas", "Sobremesas"];

// 2. Os nossos pratos mockados (adicionei categorias a eles)
const mockProducts: (ProductProps & { categoria: string })[] = [
  {
    id: 1,
    nome: "Salada Power Mix",
    descricao: "Mix de folhas verdes, quinoa, tomate cereja, amêndoas tostadas e molho de mostarda.",
    preco: 28.50,
    healthScore: "A",
    categoria: "Saudáveis",
    imgUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    nome: "Frango Grelhado Fit",
    descricao: "Peito de frango grelhado no azeite com batata doce rústica e brócolis.",
    preco: 35.00,
    healthScore: "B",
    categoria: "Saudáveis",
    imgUrl: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    nome: "Wrap de Atum",
    descricao: "Massa integral fininha recheada com patê de atum e alface americana.",
    preco: 22.90,
    healthScore: "C",
    categoria: "Lanches",
    imgUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 4,
    nome: "Smash Burger Duplo",
    descricao: "Pão brioche, dois blends de 90g, cheddar duplo, bacon e molho da casa.",
    preco: 32.00,
    healthScore: "D",
    categoria: "Lanches",
    imgUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 5,
    nome: "Brownie Super Trufado",
    descricao: "Brownie de chocolate ao leite com cobertura de ganache. Muito açúcar.",
    preco: 18.00,
    healthScore: "E",
    categoria: "Sobremesas",
    imgUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 6,
    nome: "Suco Verde Detox",
    descricao: "Couve, maçã verde, gengibre, limão e hortelã. Sem açúcar.",
    preco: 12.00,
    healthScore: "A",
    categoria: "Bebidas",
    imgUrl: "https://images.unsplash.com/photo-1610970881699-44a5587ce578?q=80&w=600&auto=format&fit=crop"
  }
];

export function Home() {
  // 1. Estado para saber qual filtro está ativo
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  // 2. A Mágica do Filtro: Se for "Todos", mostra tudo. Se não, filtra pela categoria.
  const produtosFiltrados = categoriaAtiva === "Todos" 
    ? mockProducts 
    : mockProducts.filter(produto => produto.categoria === categoriaAtiva);

  return (
    <div className="pb-16">
      <HeroSection />
      
      <section className="mt-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 px-2 gap-6">
          <h2 className="text-2xl font-bold text-surface-text">
            Cardápio Inteligente
          </h2>
          
          {/* 3. Os Botões de Filtro */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                onClick={() => setCategoriaAtiva(categoria)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  categoriaAtiva === categoria
                    ? "bg-river-green text-white shadow-md shadow-river-green/30" // Estilo Ativo
                    : "bg-surface-card text-surface-muted border border-slate-200 hover:border-river-green hover:text-river-green" // Estilo Inativo
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>

        {/* 4. A Vitrine (Agora usando os produtosFiltrados) */}
        {produtosFiltrados.length === 0 ? (
          <div className="text-center py-20 text-surface-muted">
            Nenhum produto encontrado nesta categoria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => (
              <ProductCard 
                key={produto.id}
                id={produto.id}
                nome={produto.nome}
                descricao={produto.descricao}
                preco={produto.preco}
                healthScore={produto.healthScore}
                imgUrl={produto.imgUrl}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}