// src/pages/admin/Orders.tsx
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  CheckCircle, 
  CookingPot, 
  Motorcycle, 
  XCircle, 
  Receipt,
  User,
  Warning,
  Eye,
  ClockCounterClockwise,
  Kanban,
  MapPin,
  CreditCard,
  CalendarBlank
} from '@phosphor-icons/react';

enum PedidoStatus {
  PENDENTE = 'pendente',
  PREPARANDO = 'preparando',
  SAIU_PARA_ENTREGA = 'saiu_para_entrega',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado',
}

interface ItemPedido {
  id: number;
  quantidade: number;
  nomeProdutoSnapshot: string;
  precoUnitario: number;
}

interface Pedido {
  id: number;
  data: string;
  status: PedidoStatus;
  valorTotal: number;
  taxaEntrega: number;
  metodoPagamento: string;
  enderecoEntrega: string;
  comentario: string;
  cliente: { nome: string; usuario: string };
  itens: ItemPedido[];
}

export function Orders() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ativos' | 'historico'>('ativos');
  
  // Modais de Controle de Fluxo
  const [pinModalOpen, setPinModalOpen] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
  
  const [pinDigitado, setPinDigitado] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPedidos();
  }, []);

  async function fetchPedidos() {
    try {
      setLoading(true);
      const response = await api.get('/pedidos');
      setPedidos(response.data);
    } catch (error) {
      toast.error("Erro ao carregar os pedidos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id: number, novoStatus: PedidoStatus) {
    try {
      setIsUpdating(true);
      await api.patch(`/pedidos/${id}/status`, { status: novoStatus });
      toast.success(`Pedido atualizado com sucesso!`);
      setSelectedOrder(null); 
      fetchPedidos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar pedido.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleConfirmarEntrega(e: React.FormEvent) {
    e.preventDefault();
    if (!pinModalOpen || pinDigitado.length < 4) return;

    try {
      setIsUpdating(true);
      await api.patch(`/pedidos/${pinModalOpen}/confirmar-entrega`, { codigo: pinDigitado });
      toast.success("Entrega confirmada com sucesso!");
      setPinModalOpen(null);
      setPinDigitado('');
      setSelectedOrder(null);
      fetchPedidos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "PIN Inválido!");
    } finally {
      setIsUpdating(false);
    }
  }

  // Separação dos Pedidos por categoria de exibição
  const pedidosAtivos = pedidos.filter(p => 
    p.status === PedidoStatus.PENDENTE || 
    p.status === PedidoStatus.PREPARANDO || 
    p.status === PedidoStatus.SAIU_PARA_ENTREGA
  );

  const historicoPedidos = pedidos.filter(p => 
    p.status === PedidoStatus.ENTREGUE || 
    p.status === PedidoStatus.CANCELADO
  );

  const colunasKanban = [
    { status: PedidoStatus.PENDENTE, titulo: 'Novos Pedidos', bg: 'bg-slate-50 border-slate-100', text: 'text-slate-700' },
    { status: PedidoStatus.PREPARANDO, titulo: 'Na Cozinha', bg: 'bg-river-light/20 border-river-light', text: 'text-river-dark' },
    { status: PedidoStatus.SAIU_PARA_ENTREGA, titulo: 'Em Rota', bg: 'bg-blue-50 border-blue-100', text: 'text-blue-800' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-river-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-surface-muted font-bold">Buscando painel de pedidos...</p>
      </div>
    );
  }

  // Componente interno para renderizar o cartão no quadro Kanban
  const OrderCard = ({ pedido }: { pedido: Pedido }) => (
    <div className="bg-surface-card border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all animate-fade-in relative group">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-river-dark bg-river-light px-2 py-0.5 rounded-lg">#{pedido.id}</span>
            <span className="text-[10px] text-surface-muted font-bold">
              {new Date(pedido.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h3 className="font-bold text-surface-text mt-2 flex items-center gap-1.5 truncate max-w-[140px]">
            {pedido.cliente.nome}
          </h3>
        </div>
        <button 
          onClick={() => setSelectedOrder(pedido)}
          className="p-2 text-slate-400 hover:text-river-green hover:bg-river-light rounded-xl transition-all"
          title="Ver Detalhes Completos"
        >
          <Eye size={18} weight="bold" />
        </button>
      </div>

      <div className="text-xs text-surface-muted truncate border-b border-dashed border-slate-100 pb-2">
        {pedido.itens.map(i => `${i.quantidade}x ${i.nomeProdutoSnapshot}`).join(', ')}
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs font-bold text-slate-800">R$ {Number(pedido.valorTotal).toFixed(2).replace('.', ',')}</span>
        <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{pedido.metodoPagamento}</span>
      </div>

      <div className="mt-2 flex gap-1.5">
        {pedido.status === PedidoStatus.PENDENTE && (
          <button 
            onClick={() => handleUpdateStatus(pedido.id, PedidoStatus.PREPARANDO)}
            className="w-full py-2 rounded-xl text-xs font-bold text-white bg-river-dark hover:bg-river-green transition-colors flex items-center justify-center gap-1"
          >
            <CookingPot size={14} /> Aceitar
          </button>
        )}
        {pedido.status === PedidoStatus.PREPARANDO && (
          <button 
            onClick={() => handleUpdateStatus(pedido.id, PedidoStatus.SAIU_PARA_ENTREGA)}
            className="w-full py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
          >
            <Motorcycle size={14} /> Despachar
          </button>
        )}
        {pedido.status === PedidoStatus.SAIU_PARA_ENTREGA && (
          <button 
            onClick={() => setPinModalOpen(pedido.id)}
            className="w-full py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
          >
            <CheckCircle size={14} /> Validar PIN
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 h-[calc(100vh-2rem)] flex flex-col overflow-hidden pb-4">
      {/* HEADER + FILTROS DE NAVEGAÇÃO */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-surface-text tracking-tight flex items-center gap-3">
            <Receipt size={32} className="text-river-green" weight="fill" />
            Painel de Pedidos
          </h1>
        </div>
        
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('ativos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'ativos' ? 'bg-white text-river-dark shadow-sm' : 'text-surface-muted hover:text-slate-800'}`}
          >
            <Kanban size={16} weight="bold" /> Ativos ({pedidosAtivos.length})
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'historico' ? 'bg-white text-river-dark shadow-sm' : 'text-surface-muted hover:text-slate-800'}`}
          >
            <ClockCounterClockwise size={16} weight="bold" /> Histórico ({historicoPedidos.length})
          </button>
        </div>
      </header>

      {/* CONTEÚDO DAS ABAS */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'ativos' ? (
          /* ABA 1: KANBAN */
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
            {colunasKanban.map(col => {
              const listaFiltrada = pedidosAtivos.filter(p => p.status === col.status);
              return (
                <div key={col.status} className={`${col.bg} rounded-[2rem] p-4 flex flex-col h-full overflow-hidden border`}>
                  <h2 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center justify-between px-2 ${col.text}`}>
                    {col.titulo}
                    <span className="bg-white/80 px-2 py-0.5 rounded-full text-xs shadow-sm border border-slate-100">{listaFiltrada.length}</span>
                  </h2>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-16 custom-scrollbar">
                    {listaFiltrada.map(p => <OrderCard key={p.id} pedido={p} />)}
                    {listaFiltrada.length === 0 && <p className="text-center text-slate-400 text-xs py-10 italic">Nenhum pedido nesta fase.</p>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ABA 2: LISTAGEM DE HISTÓRICO */
          <div className="h-full bg-surface-card rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto pb-16 custom-scrollbar">
              {historicoPedidos.length === 0 ? (
                <div className="text-center p-20 text-surface-muted italic">Nenhum pedido finalizado ou cancelado no histórico.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-surface-muted">Pedido</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-surface-muted">Cliente</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-surface-muted">Total</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-surface-muted">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-surface-muted text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {historicoPedidos.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-river-dark text-sm">#{p.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-surface-text text-sm">{p.cliente.nome}</p>
                          <p className="text-xs text-surface-muted">
                            {new Date(p.data).toLocaleDateString('pt-BR')} às {new Date(p.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700 text-sm">
                          R$ {Number(p.valorTotal).toFixed(2).replace('.', ',')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${p.status === PedidoStatus.ENTREGUE ? 'bg-emerald-100 text-emerald-700' : 'bg-score-E/10 text-score-E'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(p)}
                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-river-light text-surface-muted hover:text-river-dark font-bold px-3 py-1.5 rounded-xl text-xs transition-all"
                          >
                            <Eye size={16} /> Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL UNIVERSAL DE DETALHES COMPLETO */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-surface-text">Pedido #{selectedOrder.id}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${selectedOrder.status === PedidoStatus.ENTREGUE ? 'bg-emerald-100 text-emerald-700' : selectedOrder.status === PedidoStatus.CANCELADO ? 'bg-score-E/10 text-score-E' : 'bg-river-light text-river-dark'}`}>
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-surface-muted flex items-center gap-1 mt-1">
                  <CalendarBlank size={14} /> 
                  {new Date(selectedOrder.data).toLocaleString('pt-BR')}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">Fechar</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Informações do Cliente */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Cliente</h4>
                <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {selectedOrder.cliente.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-text">{selectedOrder.cliente.nome}</p>
                    <p className="text-xs text-surface-muted">{selectedOrder.cliente.usuario}</p>
                  </div>
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Endereço de Entrega</h4>
                <div className="bg-slate-50 p-3 rounded-xl flex gap-2.5 text-slate-700">
                  <MapPin size={18} className="text-river-green shrink-0 mt-0.5" weight="fill" />
                  <p className="text-sm font-medium leading-relaxed">{selectedOrder.enderecoEntrega}</p>
                </div>
              </div>

              {/* Itens */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Itens do Carrinho</h4>
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedOrder.itens.map(item => (
                    <div key={item.id} className="p-3 flex justify-between items-center text-sm">
                      <span className="font-medium text-surface-text"><strong className="text-river-dark">{item.quantidade}x</strong> {item.nomeProdutoSnapshot}</span>
                      <span className="font-bold text-slate-600">R$ {(item.precoUnitario * item.quantidade).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observação */}
              {selectedOrder.comentario && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Observações do Cliente</h4>
                  <div className="bg-amber-50 border border-amber-100 text-amber-800 text-sm p-3 rounded-xl flex gap-2">
                    <Warning size={18} weight="bold" className="shrink-0" />
                    <span className="italic">{selectedOrder.comentario}</span>
                  </div>
                </div>
              )}

              {/* Resumo Financeiro */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-surface-muted">
                  <span>Taxa de Entrega</span>
                  <span>R$ {Number(selectedOrder.taxaEntrega).toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-base font-black text-surface-text border-t border-dashed border-slate-100 pt-2">
                  <span className="flex items-center gap-1.5">
                    <CreditCard size={18} className="text-slate-400" /> Total ({selectedOrder.metodoPagamento})
                  </span>
                  <span className="text-river-dark">R$ {Number(selectedOrder.valorTotal).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>

            {/* Ações Internas do Modal */}
            {selectedOrder.status !== PedidoStatus.ENTREGUE && selectedOrder.status !== PedidoStatus.CANCELADO && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                <button
                  onClick={() => setOrderToCancel(selectedOrder.id)}
                  disabled={isUpdating}
                  className="px-4 py-3 bg-score-E/10 hover:bg-score-E text-score-E hover:text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} weight="bold" /> Cancelar Pedido
                </button>

                {selectedOrder.status === PedidoStatus.PENDENTE && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, PedidoStatus.PREPARANDO)}
                    className="flex-1 py-3 bg-river-dark hover:bg-river-green text-white font-bold rounded-xl text-sm transition-all"
                  >
                    Aceitar e Ir para Cozinha
                  </button>
                )}
                {selectedOrder.status === PedidoStatus.PREPARANDO && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, PedidoStatus.SAIU_PARA_ENTREGA)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all"
                  >
                    Despachar para Entrega
                  </button>
                )}
                {selectedOrder.status === PedidoStatus.SAIU_PARA_ENTREGA && (
                  <button
                    onClick={() => { setPinModalOpen(selectedOrder.id); }}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all"
                  >
                    Confirmar Entrega (PIN)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE VALIDAÇÃO DO PIN */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 mx-auto">
              <CheckCircle size={32} weight="fill" />
            </div>
            <h3 className="text-xl font-black text-center text-surface-text mb-2">Confirmar Entrega</h3>
            <p className="text-center text-sm text-surface-muted mb-6">Digite o código de 4 dígitos informado pelo cliente.</p>
            <form onSubmit={handleConfirmarEntrega} className="space-y-6">
              <input 
                type="text" maxLength={4} value={pinDigitado}
                onChange={e => setPinDigitado(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                className="w-full text-center text-4xl tracking-[0.5em] font-black bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                autoFocus
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setPinModalOpen(null); setPinDigitado(''); }} className="flex-1 py-3 px-4 rounded-xl font-bold text-surface-muted hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={pinDigitado.length < 4} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50">Entregar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CANCELAMENTO PREMIUM */}
      {orderToCancel && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-score-E/10 text-score-E flex items-center justify-center mb-6 mx-auto">
              <Warning size={32} weight="fill" />
            </div>
            <h3 className="text-xl font-black text-center text-surface-text mb-2">Cancelar Pedido?</h3>
            <p className="text-center text-sm text-surface-muted mb-8 leading-relaxed">
              Tem certeza que deseja cancelar o pedido <strong className="text-river-dark">#{orderToCancel}</strong>? Essa ação não pode ser desfeita e o cliente será notificado.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                disabled={isUpdating}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-surface-muted hover:bg-slate-100 transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdateStatus(orderToCancel, PedidoStatus.CANCELADO);
                  setOrderToCancel(null);
                }}
                disabled={isUpdating}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-score-E hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                {isUpdating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Sim, cancelar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}