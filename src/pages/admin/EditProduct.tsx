import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { CheckCircle, Tag, Image as ImageIcon, UploadSimple, ArrowLeft } from '@phosphor-icons/react';

import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { productSchema, type ProductFormInput } from '../../schemas/productSchema';

interface Category { id: number; descricao: string; }
interface TagOption { id: string; label: string; }

export function EditProduct() {
  const { id } = useParams(); // Pega o ID do produto da URL
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileName, setFileName] = useState<string>('');

  const DEFAULT_IMAGE = "https://ik.imagekit.io/nuqrdttx8/image.png?updatedAt=1776713581299";

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
  });

  const selectedTagIds = watch('tagsPreparo') || [];

  // CARREGAMENTO DE DADOS
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Busca Categorias, Tags e os Dados do Produto em paralelo
        const [catRes, tagRes, prodRes] = await Promise.all([
          api.get('/categorias/all'),
          api.get('/produtos/tags'),
          api.get(`/produtos/${id}`)
        ]);

        setCategories(catRes.data);
        setAvailableTags(tagRes.data);

        // PREENCHIMENTO DO FORMULÁRIO (A mágica acontece aqui)
        const product = prodRes.data;
        reset({
          nome: product.nome,
          descricao: product.descricao,
          preco: product.preco,
          categoria_id: product.categoria?.id,
          tagsPreparo: product.tagsPreparo,
          imgUrl: product.imgUrl
        });

      } catch (error) {
        toast.error("Erro ao carregar dados do produto.");
        navigate('/restaurante/produtos'); // Volta se der erro
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, reset, navigate]);

  const toggleTag = (tagId: string) => {
    const current = [...selectedTagIds];
    const index = current.indexOf(tagId);
    index > -1 ? current.splice(index, 1) : current.push(tagId);
    setValue('tagsPreparo', current, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<ProductFormInput> = async (data) => {
    try {
      const payload = {
        id: Number(id), // Importante enviar o ID para o PUT saber quem atualizar
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        imgUrl: data.imgUrl || DEFAULT_IMAGE,
        tagsPreparo: data.tagsPreparo,
        categoria: { id: Number(data.categoria_id) },
        usuario: { id: user?.id }
      };

      await api.put('/produtos', payload);
      toast.success("Prato atualizado com sucesso!");
      navigate('/restaurante/produtos'); // Volta para a lista
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-river-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-surface-muted font-bold">Buscando informações do prato...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-surface-muted hover:text-river-dark transition-colors mb-2 text-sm font-bold"
          >
            <ArrowLeft size={16} weight="bold" /> Voltar
          </button>
          <h1 className="text-3xl font-black text-surface-text">Editar Prato</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CAMPOS PRINCIPAIS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2 text-surface-muted uppercase">Nome do Prato</label>
              <input {...register('nome')} className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green" />
              {errors.nome && <p className="text-xs text-score-E mt-1 font-bold">{errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-surface-muted uppercase">Preço (R$)</label>
                <input type="number" step="0.01" {...register('preco')} className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-surface-muted uppercase">Categoria</label>
                <select {...register('categoria_id')} className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.descricao}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-surface-muted uppercase">Descrição</label>
              <textarea {...register('descricao')} rows={4} className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 resize-none outline-none focus:border-river-green" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-surface-muted uppercase">Alterar Foto</label>
              <div className="relative group">
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
                <div className="w-full bg-surface-bg border-2 border-dashed border-slate-200 rounded-xl px-4 py-6 flex flex-col items-center justify-center gap-2 group-hover:border-river-green transition-colors">
                  <UploadSimple size={24} className="text-slate-400 group-hover:text-river-green" />
                  <span className="text-xs font-medium text-slate-500">{fileName || "Clique para trocar a imagem"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR DE TAGS */}
        <div className="space-y-6">
          <div className="bg-surface-card p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Tag size={20} className="text-river-green" weight="bold" /> Tags de Preparo
            </h3>
            
            <div className="flex flex-wrap gap-2 min-h-[200px] content-start">
              {availableTags.map(tag => (
                <button
                  key={tag.id} type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                    selectedTagIds.includes(tag.id) ? 'bg-river-green text-white shadow-md' : 'bg-surface-bg text-surface-muted border border-slate-100'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className="w-full bg-river-dark hover:bg-river-green text-white font-black py-5 rounded-3xl transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Atualizando...' : 'Salvar Alterações'}
            <CheckCircle size={24} weight="bold" />
          </button>
        </div>
      </form>
    </div>
  );
}