// src/components/ProductCard.tsx
import { ShoppingCartIcon } from '@phosphor-icons/react';
import { TagHealthScore, type HealthScoreType } from './TagHealthScore';
// 1. Importe o Zustand e o Toast
import { useCartStore } from '../store/useCartStore';
import { toast } from 'react-toastify';

// Tipagem baseada no seu resumo do backend
export interface ProductProps {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    healthScore: HealthScoreType;
    imgUrl?: string;
}

// 1. Crie uma constante para a sua imagem padrão (fica mais limpo e fácil de mudar no futuro)
const FALLBACK_IMAGE = "https://ik.imagekit.io/nuqrdttx8/image.png?updatedAt=1776713581299";

export function ProductCard({ id, nome, descricao, preco, healthScore, imgUrl }: ProductProps) {
    // 2. Extraia a função de adicionar do Zustand
    const addItem = useCartStore((state) => state.addItem);

    // 3. Crie a função do clique
    const handleAddToCart = () => {
        addItem({ id, nome, descricao, preco, healthScore, imgUrl });
        // Dispara a notificação de sucesso
        toast.success(`${nome} adicionado ao carrinho!`, {
            position: "bottom-right",
            autoClose: 2000,
        });
    };
    return (
       <div className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">

    {/* Área da Imagem com o Badge do NutriScore sobreposto */}
    <div className="relative h-48 bg-slate-100 w-full overflow-hidden">
        
        {/* Usamos o imgUrl, mas se ele for null, já puxa o fallback. 
            Se ele existir mas estiver quebrado, o onError entra em ação. */}
        <img
            src={imgUrl || 'https://ik.imagekit.io/nuqrdttx8/image.png?updatedAt=1776713581299'}
            alt={nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
                // Se a imagem do src principal falhar, troca pra essa:
                e.currentTarget.src = 'https://ik.imagekit.io/nuqrdttx8/image.png?updatedAt=1776713581299';
                // Removemos o onError logo após para evitar um loop infinito 
                // caso o próprio ImageKit saia do ar um dia.
                e.currentTarget.onerror = null;
            }}
        />

        {/* O nosso componente brilhando aqui no canto! */}
        <div className="absolute top-3 right-3 shadow-md rounded-md">
            <TagHealthScore score={healthScore} />
        </div>
    </div>

    {/* Área de Informações */}
    <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-surface-text mb-1">{nome}</h3>
        <p className="text-sm text-surface-muted line-clamp-2 mb-4 flex-1">
            {descricao}
        </p>

        {/* Rodapé do Card: Preço e Botão de Comprar */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
            <span className="text-xl font-black text-river-dark">
                R$ {preco.toFixed(2).replace('.', ',')}
            </span>

            {/* Chame a função no botão */}
            <button
                onClick={handleAddToCart}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-bg text-river-green hover:bg-river-green hover:text-white transition-colors active:scale-95"
                title="Adicionar ao carrinho"
            >
                <ShoppingCartIcon size={20} weight="fill" />
            </button>
        </div>
    </div>
</div>
    );
}