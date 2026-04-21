// src/pages/admin/ProductList.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore'; // Importamos o store
import { TagHealthScore } from '../../components/TagHealthScore';
import {
    PencilSimple,
    Trash,
    Plus,
    WarningCircle,
    ChefHat
} from '@phosphor-icons/react';
import { toast } from 'react-toastify';

export function ProductList() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Pegamos o usuário logado do Zustand
    const user = useAuthStore((state) => state.user);

    async function fetchMyProducts() {
        if (!user?.id) return;

        try {
            setLoading(true);

            // 2. Chamamos o endpoint de busca por ID do usuário
            // O seu back retorna { id, nome, usuario, produtos: [...] }
            const response = await api.get(`/usuarios/${user.id}`);

            // 3. Extraímos apenas o array de produtos do restaurante
            setProducts(response.data.produtos || []);

        } catch (error) {
            toast.error("Não foi possível carregar o seu cardápio.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMyProducts();
    }, [user?.id]); // Recarrega se o ID do usuário mudar

    async function handleDelete(id: number, nome: string) {
        if (window.confirm(`Deseja realmente excluir "${nome}"?`)) {
            try {
                await api.delete(`/produtos/${id}`);
                toast.success("Produto removido!");
                // Atualiza a lista local removendo o item excluído
                setProducts(state => state.filter(p => p.id !== id));
            } catch {
                toast.error("Erro ao excluir produto.");
            }
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-surface-text tracking-tight">Gestão de Cardápio</h1>
                    <p className="text-surface-muted">
                        Exibindo os pratos de <span className="text-river-dark font-bold">{user?.nome}</span>
                    </p>
                </div>

                <Link
                    to="/restaurante/produtos/novo"
                    className="flex items-center justify-center gap-2 bg-river-green hover:bg-river-dark text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-river-green/20"
                >
                    <Plus size={20} weight="bold" />
                    Novo Prato
                </Link>
            </header>

            <div className="bg-surface-card rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-river-green border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-surface-muted font-medium">Carregando seus produtos...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <ChefHat size={48} weight="thin" />
                        </div>
                        <h3 className="text-xl font-bold text-surface-text">Seu cardápio está vazio</h3>
                        <p className="text-surface-muted max-w-xs mx-auto">
                            Comece cadastrando seu primeiro prato saudável para aparecer na vitrine.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-surface-muted">Prato</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-surface-muted">Preço</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-surface-muted">HealthScore</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-surface-muted text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {product.imgUrl && (
                                                    <img src={product.imgUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                )}
                                                <span className="font-bold text-surface-text">{product.nome}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-river-dark">
                                                R$ {product.preco.toFixed(2).replace('.', ',')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Usamos o score que vem do back */}
                                            <TagHealthScore score={product.healthScore >= 80 ? 'A' : product.healthScore >= 60 ? 'B' : 'C'} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">

                                                {/* BOTÃO EDITAR (LINK) */}
                                                <Link
                                                    to={`/restaurante/produtos/editar/${product.id}`}
                                                    className="inline-flex items-center justify-center p-2 text-surface-muted hover:text-river-green hover:bg-river-light rounded-xl transition-all"
                                                    title="Editar prato"
                                                >
                                                    <PencilSimple size={20} weight="bold" />
                                                </Link>

                                                {/* BOTÃO EXCLUIR (BUTTON) */}
                                                <button
                                                    onClick={() => handleDelete(product.id, product.nome)}
                                                    className="inline-flex items-center justify-center p-2 text-surface-muted hover:text-score-E hover:bg-score-E/10 rounded-xl transition-all"
                                                    title="Excluir prato"
                                                >
                                                    <Trash size={20} weight="bold" />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}