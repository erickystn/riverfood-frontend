// src/pages/admin/EditProduct.tsx
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
  const { id } = useParams(); 
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileName, setFileName] = useState<string>('');

  const DEFAULT_IMAGE = "https://ik.imagekit.io/nuqrdttx8/image.png?updatedAt=1776713581299";

  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { tagsPreparo: [] }
  });

  const selectedTagIds = watch('tagsPreparo') || [];

  // CARREGAMENTO DE DADOS
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catRes, tagRes, prodRes] = await Promise.all([
          api.get('/categorias/all'),
          api.get('/produtos/tags'),
          api.get(`/produtos/${id}`)
        ]);

        setCategories(catRes.data);
        setAvailableTags(tagRes.data);

        const product = prodRes.data;

        // 💡 APENAS A DEFESA DO ARRAY: Garante que o Front receba uma lista, mesmo que o back mande string
        let tagsFormatadas = product.tagsPreparo;
        if (typeof tagsFormatadas === 'string') {
          tagsFormatadas = tagsFormatadas.split(',').map((t: string) => t.trim());
        } else if (!Array.isArray(tagsFormatadas)) {
          tagsFormatadas = [];
        }

        // PREENCHIMENTO DO FORMULÁRIO
        reset({
          nome: product.nome,
          descricao: product.descricao,
          preco: product.preco,
          categoria_id: product.categoria?.id,
          tagsPreparo: tagsFormatadas, // Injeta direto, os dados já estão limpos!
          imgUrl: product.imgUrl
        });

        // Força a atualização pros botões acenderem
        setValue('tagsPreparo', tagsFormatadas);

      } catch (error) {
        toast.error("Erro ao carregar dados do produto.");
        navigate('/restaurante/produtos'); 
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, reset, setValue, navigate]);

  const toggleTag = (tagId: string) => {
    const current = [...selectedTagIds];
    const index = current.indexOf(tagId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(tagId);
    }
    setValue('tagsPreparo', current, { shouldValidate: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setValue('imgUrl', DEFAULT_IMAGE, { shouldDirty: true });
    }
  };

  const onSubmit: SubmitHandler<ProductFormInput> = async (data) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado.");
      return;
    }

    try {
      // O payload envia direto o que tá no Hook Form
      const payload = {
        id: Number(id), 
        nome: data.nome,
        descricao: data.descricao,
        preco: Number(data.preco),
        imgUrl: data.imgUrl || DEFAULT_IMAGE,
        tagsPreparo: data.tagsPreparo, 
        categoria: { id: Number(data.categoria_id) },
        usuario: { id: user.id }
      };

      await api.put('/produtos', payload);
      toast.success("Prato atualizado com sucesso!");
      navigate('/restaurante/produtos'); 
    } catch (error: any) {
      toast.error(error.response?.data?.message?.[0] || error.response?.data?.message || "Erro ao atualizar.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-river-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-surface-muted font-bold animate-pulse">Buscando informações do prato...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <header className="mb-10">
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-surface-muted hover:text-river-dark transition-colors mb-4 text-sm font-bold w-fit"
        >
          <ArrowLeft size={16} weight="bold" /> Voltar para o Cardápio
        </button>
        <h1 className="text-3xl font-black text-surface-text tracking-tight">Editar Prato</h1>
        <p className="text-surface-muted italic">Ajuste os ingredientes e detalhes deste item.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LADO ESQUERDO: Dados Principais */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-surface-muted uppercase tracking-wider mb-2">Nome do Prato</label>
              <input 
                {...register('nome')} 
                className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green transition-colors font-medium text-slate-800" 
              />
              {errors.nome && <p className="text-xs text-score-E mt-1 font-bold">{errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-surface-muted uppercase tracking-wider mb-2">Preço (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  {...register('preco')} 
                  className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green transition-colors font-medium text-slate-800" 
                />
                {errors.preco && <p className="text-xs text-score-E mt-1 font-bold">{errors.preco.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-muted uppercase tracking-wider mb-2">Categoria</label>
                <select 
                  {...register('categoria_id')} 
                  className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green transition-colors font-medium text-slate-800 cursor-pointer"
                >
                  <option value={0} disabled>Selecione...</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.descricao}</option>)}
                </select>
                {errors.categoria_id && <p className="text-xs text-score-E mt-1 font-bold">{errors.categoria_id.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-muted uppercase tracking-wider mb-2">Descrição</label>
              <textarea 
                {...register('descricao')} 
                rows={4} 
                className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 resize-none outline-none focus:border-river-green transition-colors font-medium text-slate-800" 
              />
              {errors.descricao && <p className="text-xs text-score-E mt-1 font-bold">{errors.descricao.message}</p>}
            </div>

            {/* SELETOR DE IMAGEM */}
            <div>
              <label className="block text-xs font-bold text-surface-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                <ImageIcon size={18} /> Alterar Foto do Prato
              </label>
              
              <div className="relative group cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`w-full border-2 border-dashed rounded-xl px-4 py-8 flex flex-col items-center justify-center gap-2 transition-colors ${fileName ? 'border-river-green bg-river-light/10' : 'border-slate-200 bg-surface-bg group-hover:border-river-green'}`}>
                  <UploadSimple size={32} className={fileName ? 'text-river-green' : 'text-slate-400 group-hover:text-river-green'} />
                  <span className={`text-sm font-bold ${fileName ? 'text-river-dark' : 'text-slate-500'}`}>
                    {fileName ? `Nova imagem: ${fileName}` : "Clique para trocar a imagem atual"}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">Apenas JPG, PNG ou WEBP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Sidebar de Tags & Botão de Salvar */}
        <div className="space-y-6">
          <div className="bg-surface-card p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-surface-text">
              <Tag size={20} className="text-river-green" weight="bold" /> Tags de Preparo
            </h3>
            <p className="text-xs text-surface-muted mb-4">Atualize as tags para recalcular o <strong>HealthScore</strong>. (Selecione pelo menos 3)</p>
            
            <div className="flex flex-wrap gap-2 min-h-[150px] content-start">
              {availableTags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id} 
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${
                      isSelected 
                      ? 'bg-river-green text-white shadow-md shadow-river-green/30 scale-105' 
                      : 'bg-surface-bg text-surface-muted border border-slate-200 hover:border-river-green/50 hover:text-river-green'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
            {errors.tagsPreparo && <p className="mt-4 text-xs text-score-E font-black text-center">{errors.tagsPreparo.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-river-dark hover:bg-river-green text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-river-dark/10 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Salvar Alterações
                <CheckCircle size={24} weight="bold" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}