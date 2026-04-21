import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { PlusCircle, Tag, Image as ImageIcon, UploadSimple } from '@phosphor-icons/react';

import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { productSchema, type ProductFormInput } from '../../schemas/productSchema';

interface Category { id: number; descricao: string; }
interface TagOption { id: string; label: string; }

export function NewProduct() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileName, setFileName] = useState<string>(''); // Para mostrar o nome do arquivo selecionado

  const DEFAULT_IMAGE = "https://ik.imagekit.io/nuqrdttx8/image.png?updatedAt=1776713581299";
  const user = useAuthStore((state) => state.user);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { nome: '', descricao: '', preco: 0, categoria_id: 0, tagsPreparo: [], imgUrl: '' }
  });

  const selectedTagIds = watch('tagsPreparo') || [];

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, tagRes] = await Promise.all([
          api.get('/categorias/all'), // Ajuste para sua rota de categorias
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
    index > -1 ? current.splice(index, 1) : current.push(tagId);
    setValue('tagsPreparo', current, { shouldValidate: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Aqui você poderia converter para Base64 ou guardar o File, 
      // mas para a apresentação vamos apenas simular a seleção.
    }
  };

  const onSubmit: SubmitHandler<ProductFormInput> = async (data) => {
    if (!user?.id) return;

    try {
      // PAYLOAD COMPLETO E CORRIGIDO
      const payload = {
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        imgUrl: DEFAULT_IMAGE, // Forçamos o link padrão por trás dos panos
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
      reset();
      setFileName('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar no banco de dados.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-surface-text">Cadastrar Prato</h1>
        <p className="text-surface-muted italic">Gerencie o cardápio do restaurante {user?.nome}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            
            <div>
              <label className="block text-sm font-bold mb-2">Nome do Prato</label>
              <input {...register('nome')} className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-river-green" />
              {errors.nome && <p className="text-xs text-score-E mt-1">{errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Preço (R$)</label>
                <input type="number" step="0.01" {...register('preco')} className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Categoria</label>
                <select {...register('categoria_id')} className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 outline-none">
                  <option value={0}>Selecione...</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.descricao}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Descrição</label>
              <textarea {...register('descricao')} rows={4} className="w-full bg-surface-bg border border-slate-200 rounded-xl px-4 py-3 resize-none outline-none focus:border-river-green" />
            </div>

            {/* SELETOR DE IMAGEM LOCAL (MODO APRESENTAÇÃO) */}
            <div>
              <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                <ImageIcon size={18} /> Foto do Prato
              </label>
              
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full bg-surface-bg border-2 border-dashed border-slate-200 rounded-xl px-4 py-8 flex flex-col items-center justify-center gap-2 group-hover:border-river-green transition-colors">
                  <UploadSimple size={32} className="text-slate-400 group-hover:text-river-green" />
                  <span className="text-sm font-medium text-slate-500">
                    {fileName ? `Selecionado: ${fileName}` : "Clique para selecionar uma imagem local"}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">Apenas JPG, PNG ou WEBP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-card p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Tag size={20} className="text-river-green" weight="bold" /> Tags de Preparo
            </h3>
            
            <div className="flex flex-wrap gap-2 min-h-[200px] content-start">
              {loading ? <div className="w-full h-20 bg-slate-50 animate-pulse rounded-xl" /> : 
                availableTags.map(tag => (
                  <button
                    key={tag.id} type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                      selectedTagIds.includes(tag.id) ? 'bg-river-green text-white shadow-md' : 'bg-surface-bg text-surface-muted border border-slate-100'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))
              }
            </div>
            {errors.tagsPreparo && <p className="mt-4 text-xs text-score-E font-black text-center">{errors.tagsPreparo.message}</p>}
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className="w-full bg-river-dark hover:bg-river-green text-white font-black py-5 rounded-3xl transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Finalizar Cadastro'}
            <PlusCircle size={24} weight="bold" />
          </button>
        </div>
      </form>
    </div>
  );
}