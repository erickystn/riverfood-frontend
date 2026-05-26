// src/pages/admin/Orders.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  CheckCircle, CookingPot, Motorcycle, XCircle, Receipt, Warning, Eye, 
  ClockCounterClockwise, Kanban, MapPin, CreditCard, Users, 
  CaretDown, Funnel, CalendarBlank, PrinterIcon
} from '@phosphor-icons/react';
import { useAuthStore } from '../../store/useAuthStore';
import { gerarRelatorioHistorico } from '../../utils/reportGenerator';

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
  entregador?: { id: number; nome: string; foto?: string } | null;
  itens: ItemPedido[];
}

interface Entregador {
  id: number;
  nome: string;
}

export function Orders() {
  const usuarioLogado = useAuthStore((state) => state.user);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ativos' | 'historico'>('ativos');
  
  // Modais de Controle
  const [pinModalOpen, setPinModalOpen] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState<number | null>(null);
  const [selectedEntregadorId, setSelectedEntregadorId] = useState<number | ''>('');
  const [pinDigitado, setPinDigitado] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // ESTADOS DO HISTÓRICO AVANÇADO
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [filtroData, setFiltroData] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  useEffect(() => {
    fetchPedidos(true);
    fetchEntregadores();
  }, []);

  useEffect(() => {
    if (activeTab !== 'ativos') return;
    const interval = setInterval(() => {
      fetchPedidos(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  async function fetchPedidos(showLoading = false) {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/pedidos');
      setPedidos(response.data);
    } catch (error) {
      if (showLoading) toast.error("Erro ao carregar os pedidos.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  async function fetchEntregadores() {
    try {
      const response = await api.get('/usuarios/meus-entregadores');
      setEntregadores(response.data);
    } catch (error) {
      console.error("Erro ao buscar frota.");
    }
  }

  async function handleUpdateStatus(id: number, novoStatus: PedidoStatus, entregadorId?: number) {
    try {
      setIsUpdating(true);
      await api.patch(`/pedidos/${id}/status`, { status: novoStatus, entregadorId });
      toast.success(`Pedido atualizado com sucesso!`);
      
      setSelectedOrder(null); 
      setDispatchModalOpen(null);
      setSelectedEntregadorId('');
      setOrderToCancel(null);
      
      fetchPedidos(true);
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
      fetchPedidos(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "PIN Inválido!");
    } finally {
      setIsUpdating(false);
    }
  }

  function handleOpenDispatchModal(pedidoId: number) {
    if (entregadores.length === 0) {
      toast.warning("Você precisa cadastrar um motoboy em 'Minha Frota' primeiro!");
      return;
    }
    setDispatchModalOpen(pedidoId);
  }

  // Lógica do Acordeão
  function toggleRow(id: number) {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  }

  const pedidosAtivos = pedidos.filter(p => 
    p.status === PedidoStatus.PENDENTE || 
    p.status === PedidoStatus.PREPARANDO || 
    p.status === PedidoStatus.SAIU_PARA_ENTREGA
  );

  // Lógica de Filtros do Histórico
  const historicoFiltrado = useMemo(() => {
    let filtrados = pedidos.filter(p => p.status === PedidoStatus.ENTREGUE || p.status === PedidoStatus.CANCELADO);
    
    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter(p => p.status === filtroStatus);
    }
    if (filtroData) {
      filtrados = filtrados.filter(p => p.data.startsWith(filtroData));
    }
    
    return filtrados;
  }, [pedidos, filtroStatus, filtroData]);

  const colunasKanban = [
    { status: PedidoStatus.PENDENTE, titulo: 'Novos Pedidos', bg: 'bg-slate-50 border-slate-100', text: 'text-slate-700' },
    { status: PedidoStatus.PREPARANDO, titulo: 'Na Cozinha', bg: 'bg-river-light/20 border-river-light', text: 'text-river-dark' },
    { status: PedidoStatus.SAIU_PARA_ENTREGA, titulo: 'Em Rota', bg: 'bg-blue-50 border-blue-100', text: 'text-blue-800' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-river-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold">Buscando painel de pedidos...</p>
      </div>
    );
  }

  // Card do Kanban mantido igual (apenas para Ativos)
  const OrderCard = ({ pedido }: { pedido: Pedido }) => (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col gap-3 hover:shadow-md transition-all animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-river-dark bg-river-light px-2 py-0.5 rounded-lg">#{pedido.id}</span>
            <span className="text-[10px] text-slate-400 font-bold">{new Date(pedido.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <h3 className="font-bold text-slate-800 mt-2 truncate max-w-[140px]">{pedido.cliente.nome}</h3>
        </div>
        <button onClick={() => setSelectedOrder(pedido)} className="p-2 text-slate-400 hover:text-river-green hover:bg-river-light rounded-xl transition-all"><Eye size={18} weight="bold" /></button>
      </div>
      <div className="text-xs text-slate-500 truncate border-b border-dashed border-slate-200 pb-2">{pedido.itens.map(i => `${i.quantidade}x ${i.nomeProdutoSnapshot}`).join(', ')}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs font-bold text-slate-800">R$ {Number(pedido.valorTotal).toFixed(2).replace('.', ',')}</span>
        <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{pedido.metodoPagamento}</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {pedido.status === PedidoStatus.PENDENTE && (
          <button onClick={() => handleUpdateStatus(pedido.id, PedidoStatus.PREPARANDO)} className="w-full py-2 rounded-xl text-xs font-bold text-white bg-river-dark hover:bg-river-green flex items-center justify-center gap-1"><CookingPot size={14} /> Aceitar</button>
        )}
        {pedido.status === PedidoStatus.PREPARANDO && (
          <button onClick={() => handleOpenDispatchModal(pedido.id)} className="w-full py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1"><Motorcycle size={14} /> Despachar</button>
        )}
        {pedido.status === PedidoStatus.SAIU_PARA_ENTREGA && (
          <button onClick={() => setPinModalOpen(pedido.id)} className="w-full py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center gap-1"><CheckCircle size={14} /> Validar PIN</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 h-[calc(100vh-2rem)] flex flex-col overflow-hidden pb-4">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Receipt size={32} className="text-river-green" weight="fill" /> Painel de Pedidos
        </h1>
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 self-start sm:self-auto">
          <button onClick={() => setActiveTab('ativos')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'ativos' ? 'bg-white text-river-dark shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            <Kanban size={16} weight="bold" /> Ativos ({pedidosAtivos.length})
          </button>
          <button onClick={() => setActiveTab('historico')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'historico' ? 'bg-white text-river-dark shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            <ClockCounterClockwise size={16} weight="bold" /> Histórico
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'ativos' ? (
          // KANBAN (Ativos)
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
            {colunasKanban.map(col => {
              const listaFiltrada = pedidosAtivos.filter(p => p.status === col.status);
              return (
                <div key={col.status} className={`${col.bg} rounded-[2rem] p-4 flex flex-col h-full overflow-hidden border`}>
                  <h2 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center justify-between px-2 ${col.text}`}>
                    {col.titulo} <span className="bg-white/80 px-2 py-0.5 rounded-full text-xs shadow-sm border border-slate-100">{listaFiltrada.length}</span>
                  </h2>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-16 custom-scrollbar">
                    {listaFiltrada.map(p => <OrderCard key={p.id} pedido={p} />)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // HISTÓRICO AVANÇADO (Tabela Acordeão com Filtros)
          <div className="h-full bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Barra de Filtros */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <Funnel size={16} className="text-slate-400" />
                  <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none pr-4">
                    <option value="todos">Todos os Status</option>
                    <option value="entregue">Entregues</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <CalendarBlank size={16} className="text-slate-400" />
                  <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none" />
                </div>
                {(filtroData || filtroStatus !== 'todos') && (
                  <button onClick={() => { setFiltroData(''); setFiltroStatus('todos'); }} className="text-xs font-bold text-river-dark hover:underline">Limpar Filtros</button>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <button onClick={() => setExpandedRows([])} disabled={expandedRows.length === 0} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-colors">
                  Recolher Todos
                </button>
                
                <button 
                  onClick={() => gerarRelatorioHistorico(historicoFiltrado, usuarioLogado?.nome)}
                  disabled={historicoFiltrado.length === 0}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-river-dark transition-all disabled:opacity-50 shadow-sm"
                >
                  <PrinterIcon size={16} weight="bold" /> Exportar Lista
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Pedido</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Cliente</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Total</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historicoFiltrado.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-slate-400 font-bold">Nenhum pedido encontrado.</td></tr>
                  ) : (
                    historicoFiltrado.map((p) => {
                      const isExpanded = expandedRows.includes(p.id);
                      return (
                        <React.Fragment key={p.id}>
                          {/* LINHA PRINCIPAL CLICÁVEL */}
                          <tr onClick={() => toggleRow(p.id)} className={`cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}>
                            <td className="px-6 py-4 font-black text-slate-800 text-sm">#{p.id}</td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800 text-sm">{p.cliente.nome}</p>
                              <p className="text-xs text-slate-500">{new Date(p.data).toLocaleDateString('pt-BR')} às {new Date(p.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700 text-sm">R$ {Number(p.valorTotal).toFixed(2).replace('.', ',')}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${p.status === PedidoStatus.ENTREGUE ? 'bg-emerald-100 text-emerald-700' : 'bg-score-E/10 text-score-E'}`}>{p.status}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <CaretDown size={20} weight="bold" className={`text-slate-400 transition-transform duration-300 inline-block ${isExpanded ? 'rotate-180' : ''}`} />
                            </td>
                          </tr>
                          
                          {/* CONTEÚDO EXPANDIDO (ACORDEÃO) */}
                          {isExpanded && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={5} className="p-0">
                                <div className="p-6 pt-2 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b-2 border-slate-200 shadow-inner animate-slide-down">
                                  
                                  {/* Col 1: Entrega & Motoboy */}
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Endereço de Entrega</p>
                                      <p className="text-sm font-medium text-slate-700 flex items-start gap-2">
                                        <MapPin size={16} className="text-river-green mt-0.5 shrink-0" weight="fill"/> {p.enderecoEntrega}
                                      </p>
                                    </div>
                                    {p.entregador && (
                                      <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Entregador</p>
                                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                            {p.entregador.nome.charAt(0)}
                                          </div>
                                          <span className="text-sm font-bold text-slate-800">{p.entregador.nome}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Col 2: Itens */}
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Itens Solicitados</p>
                                    <ul className="space-y-2">
                                      {p.itens.map(i => (
                                        <li key={i.id} className="text-sm text-slate-700 flex justify-between bg-white p-2 rounded-lg border border-slate-100">
                                          <span><strong className="text-river-dark">{i.quantidade}x</strong> {i.nomeProdutoSnapshot}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Col 3: Financeiro & Obs */}
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Método de Pagamento</p>
                                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <CreditCard size={16} className="text-slate-400"/> {p.metodoPagamento}
                                      </p>
                                    </div>
                                    {p.comentario && (
                                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-900 text-sm italic">
                                        <strong className="block text-[10px] not-italic uppercase tracking-widest mb-1 font-black">Observação</strong>
                                        "{p.comentario}"
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE DESPACHO */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6 mx-auto"><Users size={32} weight="fill" /></div>
            <h3 className="text-xl font-black text-center text-slate-800 mb-2">Despachar Pedido</h3>
            <p className="text-center text-sm text-slate-500 mb-6">O pedido <strong className="text-river-dark">#{dispatchModalOpen}</strong> está pronto. Quem vai levar?</p>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Selecione o Motoboy</label>
                <select value={selectedEntregadorId} onChange={(e) => setSelectedEntregadorId(Number(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold text-slate-800">
                  <option value="" disabled>Escolha na lista...</option>
                  {entregadores.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setDispatchModalOpen(null); setSelectedEntregadorId(''); }} disabled={isUpdating} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
                <button type="button" onClick={() => handleUpdateStatus(dispatchModalOpen, PedidoStatus.SAIU_PARA_ENTREGA, Number(selectedEntregadorId))} disabled={isUpdating || selectedEntregadorId === ''} className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">{isUpdating ? 'Enviando...' : 'Despachar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES (Para o Kanban) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
            
            {/* Cabeçalho do Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-800">Pedido #{selectedOrder.id}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${selectedOrder.status === PedidoStatus.ENTREGUE ? 'bg-emerald-100 text-emerald-700' : selectedOrder.status === PedidoStatus.CANCELADO ? 'bg-score-E/10 text-score-E' : 'bg-river-light text-river-dark'}`}>
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <CalendarBlank size={14} /> 
                  {new Date(selectedOrder.data).toLocaleString('pt-BR')}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm"><XCircle size={24} weight="fill"/></button>
            </div>

            {/* Corpo do Modal - DADOS RESTAURADOS COM MOTOBOY */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              
              {/* Cliente */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Cliente</h4>
                <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">{selectedOrder.cliente.nome.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{selectedOrder.cliente.nome}</p>
                    <p className="text-xs text-slate-500">{selectedOrder.cliente.usuario}</p>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Endereço de Entrega</h4>
                <div className="bg-slate-50 p-3 rounded-xl flex gap-2.5 text-slate-700">
                  <MapPin size={18} className="text-river-green shrink-0 mt-0.5" weight="fill" />
                  <p className="text-sm font-medium leading-relaxed">{selectedOrder.enderecoEntrega}</p>
                </div>
              </div>

              {/* O MOTOBOY APARECE AQUI! (Renderização Condicional) */}
              {selectedOrder.entregador && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Motoboy Responsável</h4>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {selectedOrder.entregador.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                        {selectedOrder.entregador.nome}
                        <Motorcycle size={16} weight="fill" className="text-blue-500" />
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Itens */}
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Itens do Pedido</h4>
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedOrder.itens.map(item => (
                    <div key={item.id} className="p-3 flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-800"><strong className="text-river-dark">{item.quantidade}x</strong> {item.nomeProdutoSnapshot}</span>
                      <span className="font-bold text-slate-600">R$ {(item.precoUnitario * item.quantidade).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              {selectedOrder.comentario && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Observações</h4>
                  <div className="bg-amber-50 border border-amber-100 text-amber-800 text-sm p-3 rounded-xl flex gap-2">
                    <Warning size={18} weight="bold" className="shrink-0" />
                    <span className="italic">{selectedOrder.comentario}</span>
                  </div>
                </div>
              )}

              {/* Financeiro */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Taxa de Entrega</span>
                  <span>R$ {Number(selectedOrder.taxaEntrega).toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-800 border-t border-dashed border-slate-100 pt-2">
                  <span className="flex items-center gap-1.5">
                    <CreditCard size={18} className="text-slate-400" /> Total ({selectedOrder.metodoPagamento})
                  </span>
                  <span className="text-river-dark">R$ {Number(selectedOrder.valorTotal).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
            
            {/* Rodapé e Ações dinâmicas */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
              <button onClick={() => setOrderToCancel(selectedOrder.id)} className="px-4 py-3 bg-score-E/10 text-score-E hover:bg-score-E hover:text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                <XCircle size={18} weight="bold" /> Cancelar
              </button>
              
              {selectedOrder.status === PedidoStatus.PENDENTE && (
                <button onClick={() => handleUpdateStatus(selectedOrder.id, PedidoStatus.PREPARANDO)} className="flex-1 py-3 bg-river-dark hover:bg-river-green text-white font-bold rounded-xl text-sm transition-all">Aceitar e Preparar</button>
              )}
              {selectedOrder.status === PedidoStatus.PREPARANDO && (
                <button onClick={() => handleOpenDispatchModal(selectedOrder.id)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all">Despachar</button>
              )}
              {selectedOrder.status === PedidoStatus.SAIU_PARA_ENTREGA && (
                <button onClick={() => { setPinModalOpen(selectedOrder.id); }} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all">Confirmar (PIN)</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAIS PIN e CANCELAR (Mantidos exatamente iguais) */}
      {/* 💡 MODAL DO PIN (Resgatado do limbo!) */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 mx-auto"><CheckCircle size={32} weight="fill" /></div>
            <h3 className="text-xl font-black text-center text-slate-800 mb-2">Confirmar Entrega</h3>
            <p className="text-center text-sm text-slate-500 mb-6">Digite o código de 4 dígitos informado pelo cliente.</p>
            <form onSubmit={handleConfirmarEntrega} className="space-y-6">
              <input type="text" maxLength={4} value={pinDigitado} onChange={e => setPinDigitado(e.target.value.replace(/\D/g, ''))} placeholder="0000" className="w-full text-center text-4xl tracking-[0.5em] font-black bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 outline-none focus:border-emerald-500 focus:bg-white transition-all" autoFocus />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setPinModalOpen(null); setPinDigitado(''); }} className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={pinDigitado.length < 4} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50">Entregar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {orderToCancel && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-score-E/10 text-score-E flex items-center justify-center mb-6 mx-auto"><Warning size={32} weight="fill" /></div>
            <h3 className="text-xl font-black text-center text-slate-800 mb-2">Cancelar Pedido?</h3>
            <p className="text-center text-sm text-slate-500 mb-8 leading-relaxed">Tem certeza que deseja cancelar o pedido <strong className="text-river-dark">#{orderToCancel}</strong>?</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setOrderToCancel(null)} disabled={isUpdating} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Voltar</button>
              <button type="button" onClick={() => handleUpdateStatus(orderToCancel, PedidoStatus.CANCELADO)} disabled={isUpdating} className="flex-1 py-3 rounded-xl font-bold text-white bg-score-E hover:bg-red-600">Sim, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}