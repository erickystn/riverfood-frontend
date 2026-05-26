// src/pages/admin/DeliveryView.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Motorcycle, 
  MapPin, 
  NavigationArrow, 
  CheckCircle, 
  CreditCard,
  User,
  SmileySad,
  SignOut,
  ClockCounterClockwise,
  MapTrifold,
  Warning,
  CaretDown,
  ShoppingBag
} from '@phosphor-icons/react';

enum PedidoStatus {
  SAIU_PARA_ENTREGA = 'saiu_para_entrega',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado'
}

interface ItemPedido {
  id: number;
  quantidade: number;
  nomeProdutoSnapshot: string;
}

interface Pedido {
  id: number;
  status: PedidoStatus;
  data: string;
  valorTotal: number;
  metodoPagamento: string;
  enderecoEntrega: string;
  comentario: string;
  cliente: { nome: string; usuario: string };
  restaurante: { nome: string };
  itens: ItemPedido[];
}

export function DeliveryView() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'ativas' | 'historico'>('ativas');

  const [pinModalOpen, setPinModalOpen] = useState<number | null>(null);
  const [pinDigitado, setPinDigitado] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // 💡 ESTADO DO ACORDEÃO (Guarda o ID do pedido que está expandido)
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  useEffect(() => {
    fetchEntregas(true);
  }, []);

  // 💡 POLLING AGRESSIVO PARA A DEMO (A cada 3 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEntregas(false);
    }, 3000); // 3000 milissegundos = 3 segundos
    return () => clearInterval(interval);
  }, []); // Deixei array vazio para ele atualizar independente da aba!

  async function fetchEntregas(showLoading = false) {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/pedidos');
      setPedidos(response.data);
    } catch (error) {
      if (showLoading) toast.error("Erro ao carregar entregas.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  async function handleFinalizarEntrega(e: React.FormEvent) {
    e.preventDefault();
    if (!pinModalOpen || pinDigitado.length < 4) return;

    try {
      setIsUpdating(true);
      await api.patch(`/pedidos/${pinModalOpen}/confirmar-entrega`, { codigo: pinDigitado });
      toast.success("Entrega concluída! Boa corrida!");
      setPinModalOpen(null);
      setPinDigitado('');
      fetchEntregas(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "PIN incorreto. Verifique com o cliente.");
    } finally {
      setIsUpdating(false);
    }
  }

  function handleOpenMaps(endereco: string) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=$${encodeURIComponent(endereco)}`;
    window.open(url, '_blank');
  }

  function confirmLogout() {
    logout();
    navigate('/login');
  }

  const corridasAtivas = pedidos.filter(p => p.status === PedidoStatus.SAIU_PARA_ENTREGA);
  const historico = pedidos.filter(p => p.status === PedidoStatus.ENTREGUE || p.status === PedidoStatus.CANCELADO);

  const nomeRestaurante = pedidos.length > 0 ? pedidos[0].restaurante?.nome : 'Parceiro RiverFood';

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center lg:py-6 lg:px-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-river-green/10 rounded-full blur-[120px] pointer-events-none hidden lg:block"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none hidden lg:block"></div>

      <main className="w-full max-w-lg bg-slate-50 min-h-screen lg:min-h-[820px] lg:max-h-[820px] lg:rounded-[2.5rem] lg:shadow-2xl overflow-hidden flex flex-col border border-slate-200/50 relative">
        
        <header className="bg-river-dark text-white px-6 pt-8 pb-6 shrink-0 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-river-light text-river-dark flex items-center justify-center font-black text-2xl shrink-0 border-2 border-river-green">
                {user?.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tight leading-tight">Olá, {user?.nome.split(' ')[0]}</h1>
                <p className="text-sm text-river-light font-bold flex items-center gap-1.5 mt-1 opacity-90">
                  <Motorcycle size={16} weight="fill" /> A serviço de {nomeRestaurante}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setLogoutModalOpen(true)}
              className="flex items-center gap-2.5 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white font-black text-sm uppercase tracking-widest active:scale-95"
              title="Sair da conta"
            >
              <SignOut size={24} weight="bold" />
              Sair
            </button>
          </div>

          <div className="bg-white/10 p-1.5 rounded-2xl flex gap-1.5">
            <button
              onClick={() => setActiveTab('ativas')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'ativas' ? 'bg-white text-river-dark shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              <MapTrifold size={20} weight={activeTab === 'ativas' ? 'fill' : 'regular'} /> 
              Na Rua ({corridasAtivas.length})
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'historico' ? 'bg-white text-river-dark shadow-sm' : 'text-white/60 hover:text-white'}`}
            >
              <ClockCounterClockwise size={20} weight={activeTab === 'historico' ? 'fill' : 'regular'} /> 
              Histórico
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-12 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center pt-32 gap-4">
              <div className="w-10 h-10 border-4 border-river-green border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400 font-bold">Sincronizando...</p>
            </div>
          ) : activeTab === 'ativas' ? (
            <div className="space-y-6">
              {corridasAtivas.length === 0 ? (
                <div className="text-center pt-24 px-6 space-y-4">
                  <div className="text-slate-300 flex justify-center"><SmileySad size={64} weight="thin" /></div>
                  <h3 className="font-black text-slate-700 text-lg">Nenhuma entrega pendente</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Relaxa um pouco! Assim que o restaurante despachar um prato na cozinha, ele vai aparecer aqui piscando.</p>
                </div>
              ) : (
                corridasAtivas.map((pedido) => (
                  <div key={pedido.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col gap-6 animate-fade-in relative overflow-hidden">
                    
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-river-green"></div>

                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <span className="text-sm font-black bg-slate-900 text-white px-4 py-1.5 rounded-full tracking-wider">
                        PEDIDO #{pedido.id}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {new Date(pedido.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-river-light text-river-dark flex items-center justify-center font-black text-lg shrink-0">
                        <User size={20} weight="bold" />
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-slate-800 leading-tight">{pedido.cliente.nome}</h4>
                        <p className="text-sm text-slate-500 mt-1">{pedido.cliente.usuario}</p>
                      </div>
                    </div>

                    {/* 💡 CAIXA DE ITENS DA SACOLA */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <h5 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                        <ShoppingBag size={16} weight="bold" /> Na Sacola
                      </h5>
                      <ul className="space-y-2">
                        {pedido.itens.map(item => (
                          <li key={item.id} className="text-sm font-bold text-slate-700 flex justify-between">
                            <span><strong className="text-river-dark">{item.quantidade}x</strong> {item.nomeProdutoSnapshot}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button 
                      onClick={() => handleOpenMaps(pedido.enderecoEntrega)}
                      className="w-full text-left bg-blue-50 border-2 border-blue-100 hover:border-blue-300 p-5 rounded-2xl flex items-center gap-4 transition-colors group"
                    >
                      <MapPin size={32} className="text-blue-600 shrink-0 group-hover:animate-bounce" weight="fill" />
                      <div className="flex-1">
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          Navegar <NavigationArrow size={12} weight="bold" />
                        </p>
                        <p className="text-base font-bold text-slate-800 leading-snug">{pedido.enderecoEntrega}</p>
                      </div>
                    </button>

                    {pedido.comentario && (
                      <div className="bg-amber-50 text-amber-900 text-sm p-5 rounded-2xl border-2 border-amber-100">
                        <strong className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider font-black">
                          <Warning size={18} weight="bold" /> Observação do Cliente
                        </strong> 
                        <span className="italic font-medium">{pedido.comentario}</span>
                      </div>
                    )}

                    <div className="pt-2 space-y-4">
                      
                      <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                        <div>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Método</span>
                          <div className="flex items-center gap-2 text-base font-black text-blue-700 bg-blue-100 px-4 py-2 rounded-xl w-fit border border-blue-200">
                            <CreditCard size={20} weight="fill" /> 
                            {pedido.metodoPagamento}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Valor do Pedido</span>
                          <span className="font-black text-3xl text-slate-900 leading-none">R$ {Number(pedido.valorTotal).toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setPinModalOpen(pedido.id)}
                        className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 uppercase tracking-widest transition-transform active:scale-95"
                      >
                        <CheckCircle size={24} weight="bold" /> Validar Entrega
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {historico.length === 0 ? (
                <div className="text-center pt-24 px-6 space-y-4">
                  <div className="text-slate-300 flex justify-center"><ClockCounterClockwise size={64} weight="thin" /></div>
                  <h3 className="font-black text-slate-700 text-lg">Histórico vazio</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Suas entregas finalizadas aparecerão aqui no fim do dia.</p>
                </div>
              ) : (
                historico.map((pedido) => (
                  <div key={pedido.id} className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm animate-fade-in flex flex-col opacity-90 transition-all">
                    
                    {/* 💡 ÁREA CLICÁVEL DO ACORDEÃO */}
                    <div 
                      onClick={() => setExpandedHistoryId(expandedHistoryId === pedido.id ? null : pedido.id)}
                      className="p-5 flex flex-col gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-slate-600">#{pedido.id} • {pedido.cliente.nome.split(' ')[0]}</span>
                        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider ${pedido.status === PedidoStatus.ENTREGUE ? 'bg-emerald-100 text-emerald-700' : 'bg-score-E/10 text-score-E'}`}>
                          {pedido.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-400">{new Date(pedido.data).toLocaleString('pt-BR')}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-lg text-slate-700">R$ {Number(pedido.valorTotal).toFixed(2).replace('.', ',')}</span>
                          <CaretDown size={20} className={`text-slate-400 transition-transform ${expandedHistoryId === pedido.id ? 'rotate-180' : ''}`} weight="bold" />
                        </div>
                      </div>
                    </div>

                    {/* 💡 CONTEÚDO EXPANDIDO DO ACORDEÃO */}
                    {expandedHistoryId === pedido.id && (
                      <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4 animate-slide-up">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entregue para</p>
                          <p className="text-sm font-bold text-slate-700">{pedido.cliente.nome}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Endereço de Entrega</p>
                          <p className="text-sm font-medium text-slate-700 leading-relaxed">{pedido.enderecoEntrega}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Itens Levados</p>
                          <ul className="text-xs font-bold text-slate-600 space-y-1">
                            {pedido.itens.map(item => (
                              <li key={item.id}><strong className="text-river-dark">{item.quantidade}x</strong> {item.nomeProdutoSnapshot}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {logoutModalOpen && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-slide-up text-center">
              <div className="w-16 h-16 rounded-full bg-score-E/10 text-score-E flex items-center justify-center mb-6 mx-auto">
                <SignOut size={32} weight="fill" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3">Encerrar turno?</h3>
              <p className="text-base text-slate-500 mb-8">
                Você será desconectado e deixará de receber novas corridas.
              </p>
              
              <div className="flex flex-col gap-4">
                <button onClick={confirmLogout} className="w-full py-4 rounded-xl font-black text-base uppercase tracking-wider text-white bg-score-E hover:bg-red-600 shadow-lg shadow-red-500/20 transition-colors">
                  Sim, sair do app
                </button>
                <button onClick={() => setLogoutModalOpen(false)} className="w-full py-4 rounded-xl font-black text-base uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Continuar trabalhando
                </button>
              </div>
            </div>
          </div>
        )}

        {pinModalOpen && (
          <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-t-[2.5rem] p-8 w-full shadow-2xl border-t border-slate-100 animate-slide-up space-y-8 pb-12">
              <div className="w-16 h-2 bg-slate-200 rounded-full mx-auto"></div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-800">Validação de Segurança</h3>
                <p className="text-sm text-slate-500 px-4">Solicite os 4 números ao cliente para confirmar a entrega.</p>
              </div>

              <form onSubmit={handleFinalizarEntrega} className="space-y-8">
                <input 
                  type="text" maxLength={4} pattern="\d*" inputMode="numeric"
                  value={pinDigitado} onChange={e => setPinDigitado(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                  className="w-full text-center text-6xl tracking-[0.4em] font-black bg-slate-50 border-4 border-slate-200 rounded-3xl py-6 outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                  autoFocus
                />
                
                <div className="flex gap-4">
                  <button type="button" disabled={isUpdating} onClick={() => { setPinModalOpen(null); setPinDigitado(''); }} className="flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">Voltar</button>
                  <button type="submit" disabled={pinDigitado.length < 4 || isUpdating} className="flex-2 w-full py-5 rounded-2xl font-black text-sm uppercase tracking-wider text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-50 flex items-center justify-center">
                    {isUpdating ? 'Validando...' : 'Concluir'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}