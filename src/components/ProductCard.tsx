// src/components/ProductCard.tsx
import { useState } from 'react';
import { ShoppingCartIcon } from '@phosphor-icons/react';
import { useCartStore } from '../store/useCartStore';
import { TagHealthScore } from './TagHealthScore';
import { ProductModal } from './ProductModal';

export interface ProductProps {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    imgUrl?: string;
    healthScore: number;
    tagsPreparo: string | string[];
    // Adicionamos essas duas linhas aqui embaixo:
    usuario?: { nome: string };
    categoria?: { descricao: string };
}

const FALLBACK_IMAGE = 'https://ik.imagekit.io/nuqrdttx8/image.png?updatedAt=1776713581299';

export function ProductCard(props: ProductProps) {
    const { id, nome, descricao, preco, imgUrl, healthScore } = props;

    // Estado para controlar o Modal de Raio-X
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Puxando a função de adicionar ao carrinho do Zustand
    const addItem = useCartStore((state) => state.addItem);

    // Função para adicionar ao carrinho sem abrir o modal
    function handleAddToCart(e: React.MouseEvent) {
        e.stopPropagation();

        // Como a sua Store já faz: { ...product, quantidade: 1 }
        // Você só precisa passar o 'props' (que é o ProductProps puro)
        addItem(props);
    }

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="bg-surface-card rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
            >
                {/* Área da Imagem com o Badge do NutriScore */}
                <div className="relative h-52 bg-slate-100 w-full overflow-hidden">
                    <img
                        src={imgUrl || FALLBACK_IMAGE}
                        alt={nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMAGE;
                            e.currentTarget.onerror = null;
                        }}
                    />

                    {/* Badge do HealthScore Posicionada */}
                    <div className="absolute top-4 right-4 shadow-2xl rounded-lg transform group-hover:scale-110 transition-transform">
                        <TagHealthScore score={healthScore >= 80 ? 'A' : healthScore >= 60 ? 'B' : 'C'} />
                    </div>
                </div>

                {/* Área de Informações */}
                <div className="p-6 flex flex-col flex-1">
                    <div className="mb-2">
                        <h3 className="text-lg font-black text-river-dark group-hover:text-river-green transition-colors leading-tight">
                            {nome}
                        </h3>
                    </div>

                    <p className="text-sm text-surface-muted line-clamp-2 mb-6 flex-1 leading-relaxed">
                        {descricao}
                    </p>

                    {/* Rodapé: Preço e Botão */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-surface-muted uppercase tracking-wider">Preço</span>
                            <span className="text-xl font-black text-river-dark">
                                R$ {preco.toFixed(2).replace('.', ',')}
                            </span>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-river-light text-river-green hover:bg-river-green hover:text-white transition-all shadow-sm active:scale-90"
                            title="Adicionar ao carrinho"
                        >
                            <ShoppingCartIcon size={24} weight="bold" />
                        </button>
                    </div>
                </div>
            </div>

            {/* O Modal de Detalhes que "nasce" deste card */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={props}
                // PASSAMOS APENAS O PROPS: A Store se vira com o resto!
                onAddToCart={() => addItem(props)}
            />
        </>
    );
}