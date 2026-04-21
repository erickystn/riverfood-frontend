// src/components/ProductModal.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Leaf, CheckCircle, Storefront } from '@phosphor-icons/react';
import { TagHealthScore } from './TagHealthScore';
import { api } from '../services/api'; // Importando sua instância do axios

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onAddToCart: () => void;
}

export function ProductModal({ isOpen, onClose, product, onAddToCart }: ProductModalProps) {
    const [labels, setLabels] = useState<Record<string, string>>({});

    // 1. Busca as labels dinâmicas do Backend
    useEffect(() => {
        if (isOpen) {
            async function fetchTags() {
                try {
                    const response = await api.get('/produtos/tags');
                    // Transforma [{id: "in-natura", label: "In Natura"}] em {"in-natura": "In Natura"}
                    const map = response.data.reduce((acc: any, tag: any) => {
                        acc[tag.id] = tag.label;
                        return acc;
                    }, {});
                    setLabels(map);
                } catch (error) {
                    console.error("Erro ao buscar labels das tags", error);
                }
            }
            fetchTags();
        }
    }, [isOpen]);

    if (!product) return null;

    // Função para transformar "IN_NATURA" em "in-natura" para bater com o ID do back
    const normalizeTag = (tag: string) => tag.toLowerCase().replace(/_/g, '-');

    const getLetterScore = (score: number) => {
        if (score >= 80) return 'A';
        if (score >= 60) return 'B';
        return 'C';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 cursor-zoom-out"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl z-[70] overflow-hidden"
                    >
                        <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto">

                            {/* Lado Esquerdo: Imagem */}
                            <div className="w-full md:w-1/2 h-72 md:h-auto relative">
                                <img
                                    src={product.imgUrl || 'https://ik.imagekit.io/nuqrdttx8/image.png'}
                                    className="w-full h-full object-cover"
                                    alt={product.nome}
                                />
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 left-6 p-2 bg-black/20 backdrop-blur-xl text-white rounded-full hover:bg-black/40 transition-colors shadow-lg"
                                >
                                    <X size={20} weight="bold" />
                                </button>
                            </div>

                            {/* Lado Direito: Informações */}
                            <div className="p-8 md:w-1/2 flex flex-col bg-white">
                                <div className="flex justify-between items-start mb-6">
                                    <TagHealthScore score={getLetterScore(product.healthScore)} />
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-surface-muted uppercase tracking-widest">Valor do Prato</p>
                                        <span className="text-2xl font-black text-river-dark">
                                            R$ {product.preco.toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                </div>

                                {/* NOME DO RESTAURANTE - Direto do objeto 'usuario' do seu JSON */}
                                <div className="flex items-center gap-2 text-river-green mb-2">
                                    <Storefront size={18} weight="bold" />
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {product.usuario?.nome || 'Restaurante Parceiro'}
                                    </span>
                                </div>

                                <h2 className="text-3xl font-black text-river-dark mb-3 leading-tight uppercase">
                                    {product.nome}
                                </h2>

                                <p className="text-surface-muted text-sm leading-relaxed mb-8">
                                    {product.descricao}
                                </p>

                                {/* Raio-X Nutricional Dinâmico */}
                                <div className="bg-river-light/20 rounded-[1.5rem] p-5 mb-10 border border-river-green/5">
                                    <h4 className="text-[10px] font-black text-river-dark uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Leaf size={16} weight="fill" className="text-river-green" />
                                        Análise Nutricional
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(Array.isArray(product.tagsPreparo) ? product.tagsPreparo : []).map((tag: string) => {
                                            const idNormalizado = normalizeTag(tag);
                                            const labelExibicao = labels[idNormalizado] || tag.replace(/_/g, ' ');

                                            return (
                                                <span
                                                    key={tag}
                                                    className="flex items-center gap-1.5 text-[10px] font-black text-river-green bg-white px-3 py-1.5 rounded-lg border border-river-green/10 shadow-sm"
                                                >
                                                    <CheckCircle size={14} weight="fill" />
                                                    {labelExibicao}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        onAddToCart();
                                        onClose();
                                    }}
                                    className="mt-auto w-full bg-river-green hover:bg-emerald-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-river-green/20 active:scale-95"
                                >
                                    <ShoppingCart size={22} weight="bold" />
                                    Adicionar ao Carrinho
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}