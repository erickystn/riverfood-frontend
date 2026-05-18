// src/pages/admin/ProductList.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore'; 
import { TagHealthScore } from '../../components/TagHealthScore';
import {
    PencilSimple,
    Trash,
    Plus,
    ChefHat,
    Warning // 💡 Importamos o ícone de aviso pro Modal
} from '@phosphor-icons/react';
import { toast } from 'react-toastify';
import riverfoodLogo from '../../assets/riverfood-logo.png';

export function ProductList() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 💡 Novos estados para controlar o Modal de Exclusão
    const [productToDelete, setProductToDelete] = useState<{ id: number, nome: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const user = useAuthStore((state) => state.user);

    async function fetchMyProducts() {
        if (!user) return;
        try {
            setLoading(true);
            const response = await api.get('/usuarios/perfil');
            setProducts(response.data.produtos || []);
        } catch (error) {
            toast.error("Não foi possível carregar o seu cardápio.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMyProducts();
    }, [user]); 

    // 💡 Agora essa função apenas abre o Modal
    function handleDeleteClick(id: number, nome: string) {
        setProductToDelete({ id, nome });
    }

    // 💡 Essa é a função que o botão "Sim, excluir" do Modal vai chamar
    async function confirmDelete() {
        if (!productToDelete) return;
        
        try {
            setIsDeleting(true);
            await api.delete(`/produtos/${productToDelete.id}`);
            toast.success("Produto removido com sucesso!");
            setProducts(state => state.filter(p => p.id !== productToDelete.id));
        } catch {
            toast.error("Erro ao excluir produto.");
        } finally {
            setIsDeleting(false);
            setProductToDelete(null); // Fecha o modal
        }
    }

    return (
        <div className="space-y-8 animate-fade-in relative">
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
                                {products.map((product) => {
                                    const imageSource = product.imgUrl && product.imgUrl.trim() !== "" 
                                        ? product.imgUrl 
                                        : riverfoodLogo;

                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={imageSource} 
                                                        alt={product.nome} 
                                                        className="w-10 h-10 rounded-lg object-cover bg-surface-bg border border-slate-100 p-0.5" 
                                                        onError={(e) => { (e.target as HTMLImageElement).src = riverfoodLogo; }}
                                                    />
                                                    <span className="font-bold text-surface-text">{product.nome}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-river-dark">
                                                    R$ {Number(product.preco).toFixed(2).replace('.', ',')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <TagHealthScore score={product.healthScore} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/restaurante/produtos/editar/${product.id}`}
                                                        className="inline-flex items-center justify-center p-2 text-surface-muted hover:text-river-green hover:bg-river-light rounded-xl transition-all"
                                                        title="Editar prato"
                                                    >
                                                        <PencilSimple size={20} weight="bold" />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDeleteClick(product.id, product.nome)}
                                                        className="inline-flex items-center justify-center p-2 text-surface-muted hover:text-score-E hover:bg-score-E/10 rounded-xl transition-all"
                                                        title="Excluir prato"
                                                    >
                                                        <Trash size={20} weight="bold" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 💡 O NOVO MODAL DE EXCLUSÃO ESTILOSO */}
            {productToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl transform transition-all animate-slide-up">
                        <div className="w-16 h-16 rounded-full bg-score-E/10 text-score-E flex items-center justify-center mb-6 mx-auto">
                            <Warning size={32} weight="fill" />
                        </div>
                        <h3 className="text-xl font-black text-center text-surface-text mb-2">Excluir Prato?</h3>
                        <p className="text-center text-sm text-surface-muted mb-8 leading-relaxed">
                            Tem certeza que deseja remover <strong>{productToDelete.nome}</strong> do seu cardápio? Essa ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setProductToDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-surface-muted hover:bg-slate-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-score-E hover:bg-red-600 transition-colors flex items-center justify-center"
                            >
                                {isDeleting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    'Sim, excluir'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}