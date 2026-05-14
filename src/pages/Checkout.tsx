// src/pages/Checkout.tsx
import { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { ShoppingBag, MapPin, CreditCard, Receipt, ArrowLeft, Bank, Money, ChatText } from '@phosphor-icons/react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { api } from '../services/api';

// 1. ENUM NATIVO PARA O TYPESCRIPT E PARA O ZOD
export enum MetodoPagamento {
  PIX = 'PIX',
  CARTAO = 'CARTAO'
}

// 2. O ESQUELETO DO NOSSO FORMULÁRIO (AGORA COM COMENTÁRIO)
const checkoutSchema = z.object({
  cep: z.string().min(8, 'CEP inválido'),
  rua: z.string().min(1, 'Rua obrigatória'),
  numero: z.string().min(1, 'Número obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro obrigatório'),
  cidade: z.string().min(1, 'Cidade obrigatória'),
  uf: z.string().length(2, 'UF inválida'),
  metodoPagamento: z.nativeEnum(MetodoPagamento, { message: 'Selecione o pagamento' }),
  comentario: z.string().optional() // Campo novo e opcional!
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export function Checkout() {
  const navigate = useNavigate();
  const { items, restauranteNome, restauranteId, clearCart } = useCartStore();

  const total = items.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const taxaEntrega = 5.00;

  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // 3. INICIANDO O HOOK FORM
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { metodoPagamento: MetodoPagamento.PIX }
  });

  const metodoSelecionado = watch('metodoPagamento');

  // Proteção extra: Se carrinho vazio, volta pra home (A proteção de Login já está no ProtectedRoute!)
  if (items.length === 0) {
    return <Navigate to="/" replace />;
  }

  // 4. A MÁGICA DO VIACEP
  async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
    const cepNumeros = e.target.value.replace(/\D/g, '');

    if (cepNumeros.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`);
        const data = await response.json();

        if (data.erro) {
          toast.error("CEP não encontrado nas bases dos Correios.");
        } else {
          setValue('rua', data.logradouro, { shouldValidate: true });
          setValue('bairro', data.bairro, { shouldValidate: true });
          setValue('cidade', data.localidade, { shouldValidate: true });
          setValue('uf', data.uf, { shouldValidate: true });

          toast.success("Endereço encontrado!");
        }
      } catch (error) {
        toast.error("Erro ao buscar o CEP.");
      } finally {
        setIsLoadingCep(false);
      }
    }
  }

  // 5. O DISPARO FINAL PARA A API
  async function onSubmit(data: CheckoutForm) {
    try {
      const payload = {
        restauranteId: restauranteId,
        taxaEntrega: taxaEntrega,
        enderecoEntrega: `${data.rua}, ${data.numero}${data.complemento ? ' - ' + data.complemento : ''} - ${data.bairro}, ${data.cidade}/${data.uf} (${data.cep})`,
        metodoPagamento: data.metodoPagamento,
        comentario: data.comentario, // Enviando a observação para o NestJS!
        itens: items.map(item => ({
          produtoId: item.id,
          quantidade: item.quantidade
        }))
      };

      await api.post('/pedidos', payload);

      toast.success("Pedido realizado com sucesso! A caminho do sabor.");
      clearCart();
      
      // Quando criarmos a tela, mudaremos para /meus-pedidos
      navigate('/'); 

    } catch (error: any) {
      console.error(error);
      const mensagemErro = error.response?.data?.message || "Ocorreu um erro ao processar seu pedido.";
      toast.error(mensagemErro);
    }
  }

  return (
    <div className="py-10 animate-fade-in">
      {/* CABEÇALHO */}
      <header className="mb-10 flex items-center justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-river-dark mb-2 text-sm font-bold transition-colors">
            <ArrowLeft size={16} weight="bold" /> Continuar comprando
          </Link>
          <h1 className="text-3xl font-black text-river-dark tracking-tight">Finalizar Pedido</h1>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-river-light/30 rounded-full border border-river-green/20">
          <ShoppingBag size={20} weight="bold" className="text-river-green" />
          <span className="text-xs font-black text-river-dark uppercase tracking-wide">{items.length} Itens de {restauranteNome}</span>
        </div>
      </header>

      {/* FORMULÁRIO GERAL ENVELOPANDO AS DUAS COLUNAS */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* COLUNA ESQUERDA */}
        <div className="lg:col-span-2 space-y-6">

            {/* NOVA SEÇÃO: OBSERVAÇÕES DO PEDIDO */}
          <section className="bg-surface-card p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-river-dark">
              <ChatText size={26} weight="fill" className="text-river-green" />
              Observações do Pedido
            </h3>
            
            <div>
              <label className="text-[10px] font-black text-slate-600 uppercase ml-1 tracking-wider">
                Alguma restrição ou preferência? <span className="font-normal normal-case">(Opcional)</span>
              </label>
              <textarea 
                placeholder="Ex: Tirar a cebola, enviar sachês de ketchup, carne bem passada..."
                {...register('comentario')}
                className="w-full bg-surface-bg border border-slate-300 text-slate-800 font-medium placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:border-river-green transition-all resize-none h-24 mt-1"
              ></textarea>
            </div>
          </section>

          {/* ENDEREÇO */}
          <section className="bg-surface-card p-8 rounded-[2rem] border border-slate-100 shadow-sm relative">
            {isLoadingCep && (
              <div className="absolute top-8 right-8 w-5 h-5 border-2 border-river-green border-t-transparent rounded-full animate-spin"></div>
            )}

            <h3 className="text-xl font-bold flex items-center gap-3 mb-8 text-river-dark">
              <MapPin size={26} weight="fill" className="text-river-green" />
              Onde entregamos?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-[10px] font-black text-slate-600 uppercase ml-1 tracking-wider">CEP</label>
                <input
                  type="text"
                  maxLength={9}
                  placeholder="00000-000"
                  {...register('cep')}
                  onBlur={handleCepBlur}
                  className={`w-full bg-surface-bg border text-slate-800 font-medium placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none transition-all ${errors.cep ? 'border-score-E focus:border-score-E' : 'border-slate-300 focus:border-river-green'}`}
                />
                {errors.cep && <span className="text-[10px] font-bold text-score-E">{errors.cep.message}</span>}
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-600 uppercase ml-1 tracking-wider">Rua / Logradouro</label>
                <input
                  type="text"
                  {...register('rua')}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold cursor-not-allowed"
                />
                {errors.rua && <span className="text-[10px] font-bold text-score-E">{errors.rua.message}</span>}
              </div>

              <div className="md:col-span-1">
                <label className="text-[10px] font-black text-slate-600 uppercase ml-1 tracking-wider">Número</label>
                <input
                  type="text"
                  placeholder="Ex: 123"
                  {...register('numero')}
                  className={`w-full bg-surface-bg border text-slate-800 font-medium placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none transition-all ${errors.numero ? 'border-score-E focus:border-score-E' : 'border-slate-300 focus:border-river-green'}`}
                />
                {errors.numero && <span className="text-[10px] font-bold text-score-E">{errors.numero.message}</span>}
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-600 uppercase ml-1 tracking-wider">Complemento <span className="font-normal normal-case">(Opcional)</span></label>
                <input
                  type="text"
                  placeholder="Apto 45, Bloco B"
                  {...register('complemento')}
                  className="w-full bg-surface-bg border border-slate-300 text-slate-800 font-medium placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:border-river-green transition-all"
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-[10px] font-black text-slate-600 uppercase ml-1 tracking-wider">Bairro</label>
                <input
                  type="text"
                  {...register('bairro')}
                  className="w-full bg-surface-bg border border-slate-300 text-slate-800 font-medium rounded-xl px-4 py-3 outline-none focus:border-river-green transition-all"
                />
                {errors.bairro && <span className="text-[10px] font-bold text-score-E">{errors.bairro.message}</span>}
              </div>

              <div className="md:col-span-1">
                <label className="text-[10px] font-black text-slate-600 uppercase ml-1 tracking-wider">Cidade</label>
                <input
                  type="text"
                  {...register('cidade')}
                  className="w-full bg-surface-bg border border-slate-300 text-slate-800 font-medium rounded-xl px-4 py-3 outline-none focus:border-river-green transition-all"
                />
                {errors.cidade && <span className="text-[10px] font-bold text-score-E">{errors.cidade.message}</span>}
              </div>

              <div className="md:col-span-1">
                <label className="text-[10px] font-black text-slate-600 uppercase ml-1 tracking-wider">UF</label>
                <input
                  type="text"
                  maxLength={2}
                  {...register('uf')}
                  className="w-full bg-surface-bg border border-slate-300 text-slate-800 font-medium rounded-xl px-4 py-3 outline-none focus:border-river-green transition-all uppercase"
                />
                {errors.uf && <span className="text-[10px] font-bold text-score-E">{errors.uf.message}</span>}
              </div>
            </div>
          </section>

          {/* PAGAMENTO */}
          <section className="bg-surface-card p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-8 text-river-dark">
              <CreditCard size={26} weight="fill" className="text-river-green" />
              Como deseja pagar?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all ${metodoSelecionado === 'PIX' ? 'border-river-green bg-river-green/5' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" value={MetodoPagamento.PIX} {...register('metodoPagamento')} className="sr-only" />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${metodoSelecionado === 'PIX' ? 'bg-river-green text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <Bank size={20} weight={metodoSelecionado === 'PIX' ? 'fill' : 'bold'} />
                </div>
                <div>
                  <p className="font-black text-slate-800">Pagamento via Pix</p>
                  <p className="text-xs text-slate-500 font-medium">Aprovação imediata</p>
                </div>
              </label>

              <label className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all ${metodoSelecionado === 'CARTAO' ? 'border-river-green bg-river-green/5' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" value={MetodoPagamento.CARTAO} {...register('metodoPagamento')} className="sr-only" />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${metodoSelecionado === 'CARTAO' ? 'bg-river-green text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <Money size={20} weight={metodoSelecionado === 'CARTAO' ? 'fill' : 'bold'} />
                </div>
                <div>
                  <p className="font-black text-slate-800">Cartão na Entrega</p>
                  <p className="text-xs text-slate-500 font-medium">Débito ou Crédito</p>
                </div>
              </label>
            </div>
            {errors.metodoPagamento && <span className="text-[10px] font-bold text-score-E mt-2 block">{errors.metodoPagamento.message}</span>}
          </section>

          

        </div>

        {/* COLUNA DIREITA: RESUMO */}
        <div className="lg:col-span-1">
          <aside className="bg-river-dark text-white p-8 rounded-[2.5rem] shadow-xl sticky top-24">
            <h3 className="text-lg font-black flex items-center gap-2 mb-8 uppercase tracking-widest text-river-green">
              <Receipt size={24} weight="bold" /> Resumo
            </h3>

            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-white font-semibold">{item.quantidade}x {item.nome}</span>
                  <span className="font-black text-white">R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/30 pt-6 space-y-3">
              <div className="flex justify-between text-sm text-white/90 font-semibold">
                <span>Taxa de entrega</span>
                <span>R$ {taxaEntrega.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-2xl font-black pt-4 text-white">
                <span>Total</span>
                <span className="text-river-green drop-shadow-md">R$ {(total + taxaEntrega).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-river-green hover:bg-emerald-500 text-river-dark font-black text-lg py-5 rounded-2xl transition-all mt-10 shadow-lg shadow-black/20 active:scale-95 disabled:opacity-50 flex justify-center items-center"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-river-dark border-t-transparent rounded-full animate-spin"></div>
              ) : 'Confirmar e Concluir'}
            </button>
          </aside>
        </div>

      </form>
    </div>
  );
}