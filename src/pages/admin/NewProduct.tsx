// src/pages/admin/NewProduct.tsx
import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { PlusCircle, Tag, Image as ImageIcon, UploadSimple } from '@phosphor-icons/react';

import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { productSchema, type ProductFormInput } from '../../schemas/productSchema';

interface Category { 
  id: number; 
  descricao: string; 
}

interface TagOption { 
  id: string; 
  label: string; 
}

export function NewProduct() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileName, setFileName] = useState<string>(''); 

  // Imagem mockada para a apresentação do bootcamp
  const DEFAULT_IMAGE = "https://ik.imagekit.io/nuqrdttx8/image.png?updatedAt=1776713581299";
  
  const user = useAuthStore((state) => state.user);

  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { 
      nome: '', 
      descricao: '', 
      preco: 0, 
      categoria_id: 0, 
      tagsPreparo: [], 
      imgUrl: '' 
    }
  });

  const selectedTagIds = watch('tagsPreparo') || [];

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, tagRes] = await Promise.all([
          api.get('/categorias/all'), 
          api.get('/produtos/tags')
        ]);
        setCategories(catRes.data);
        setAvailableTags(tagRes.data);
      } catch {
        toast.error("Erro ao carregar dados do servidor.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
      // Aqui a gente "finge" que fez o upload e seta a imagem padrão no form
      setValue('imgUrl', DEFAULT_IMAGE);
    }
  };

  const onSubmit: SubmitHandler<ProductFormInput> = async (data) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado.");
      return;
    }

    try {
      // 💡 Payload blindado: Garantimos que números sejam números e não strings
      const payload = {
        nome: data.nome,
        descricao: data.descricao,
        preco: Number(data.preco), // Força a conversão pra evitar erro no banco
        imgUrl: data.imgUrl || DEFAULT_IMAGE, 
        tagsPreparo: data.tagsPreparo,
        categoria: {
          id: Number(data.categoria_id)
        },
        usuario: {
          id: user.id
        }
      };

      await api.post('/produtos', payload);
      toast.success("Prato cadastrado com sucesso!");
      
      // Limpa o formulário após o sucesso
      reset();
      setFileName('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar no banco de dados.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-surface-text tracking-tight">Cadastrar Prato</h1>
        <p className="text-surface-muted italic">Adicione um novo item saudável ao cardápio de {user?.nome}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LADO ESQUERDO: Dados Principais */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-surface-muted uppercase tracking-wider mb-2">Nome do Prato</label>
              <input 
                {...register('nome')} 
                placeholder="Ex: Salada Power Mix"
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
                  placeholder="0.00"
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
                  <option value={0} disabled>Selecione uma categoria...</option>
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
                placeholder="Descreva os ingredientes e detalhes do prato..."
                className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 resize-none outline-none focus:border-river-green transition-colors font-medium text-slate-800" 
              />
              {errors.descricao && <p className="text-xs text-score-E mt-1 font-bold">{errors.descricao.message}</p>}
            </div>

            {/* SELETOR DE IMAGEM */}
            <div>
              <label className="block text-xs font-bold text-surface-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                <ImageIcon size={18} /> Foto do Prato
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
                    {fileName ? `Imagem selecionada: ${fileName}` : "Clique para selecionar uma imagem local"}
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
            <p className="text-xs text-surface-muted mb-4">Selecione as tags que definem este prato. Elas formarão o <strong>HealthScore</strong>.</p>
            
            <div className="flex flex-wrap gap-2 min-h-[150px] content-start">
              {loading ? (
                <div className="w-full h-20 bg-slate-50 animate-pulse rounded-xl" />
              ) : (
                availableTags.map(tag => {
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
                })
              )}
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
                Finalizar Cadastro
                <PlusCircle size={24} weight="bold" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}