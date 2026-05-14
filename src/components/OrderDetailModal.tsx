// src/components/OrderDetailModal.tsx
import { X, Clock, Package, Moped, CheckCircle, MapPin, CreditCard, ChatText, Receipt } from '@phosphor-icons/react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import type { Pedido } from '../pages/MeusPedidos';

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    pedido: Pedido | null; // Idealmente usar a Interface Pedido que definimos
}

export function OrderDetailModal({ isOpen, onClose, pedido }: OrderDetailModalProps) {
    if (!isOpen || !pedido) return null;

    // Mapeamento numérico para a barra de progresso
    const statusSteps = {
        pendente: 0,
        preparando: 1,
        saiu_para_entrega: 2,
        entregue: 3,
        cancelado: -1
    };

    const currentStep = statusSteps[pedido.status];

    const steps = [
        { label: 'Pendente', icon: <Clock size={20} /> },
        { label: 'Preparando', icon: <Package size={20} /> },
        { label: 'Em Rota', icon: <Moped size={20} /> },
        { label: 'Entregue', icon: <CheckCircle size={20} /> },
    ];

    async function handleCancelOrder() {
        if (!pedido) return;
        
        if (window.confirm("Deseja realmente cancelar este pedido? Esta ação não pode ser desfeita.")) {
            try {
                // Usando o endpoint de PATCH que vimos no seu Swagger
                // Supondo que a rota seja /pedidos/{id} e você envie o status novo
                await api.patch(`/pedidos/${pedido.id}`, { status: 'cancelado' });

                toast.success("Pedido cancelado com sucesso.");
                onClose(); // Fecha o modal
                // Dica: Aqui seria ideal ter uma função de 'refresh' para atualizar a lista atrás
            } catch (error) {
                toast.error("Não foi possível cancelar o pedido. Verifique se ele já entrou em preparo.");
            }
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
            {/* Overlay */}
            <div className="fixed inset-0 bg-river-dark/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal Lateral (Estilo Drawer) */}
            <div className="relative w-full max-w-lg h-full bg-surface-bg shadow-2xl flex flex-col animate-slide-right">

                {/* Cabeçalho */}
                <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-surface-card">
                    <div>
                        <h2 className="text-xl font-black text-river-dark">Detalhes do Pedido</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">#{pedido.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={24} weight="bold" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-10">

                    {/* 1. STATUS TRACKER (O Coração do Modal) */}
                    <section>
                        <div className="flex justify-between relative">
                            {/* Linha de fundo */}
                            <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 z-0" />
                            {/* Linha de progresso ativa */}
                            {pedido.status !== 'cancelado' && (
                                <div
                                    className="absolute top-5 left-0 h-1 bg-river-green transition-all duration-700"
                                    style={{ width: `${(currentStep / 3) * 100}%` }}
                                />
                            )}

                            {steps.map((step, index) => (
                                <div key={index} className="flex flex-col items-center gap-2 relative z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors ${index <= currentStep ? 'bg-river-green border-white text-white shadow-lg shadow-river-green/20' : 'bg-white border-slate-100 text-slate-300'
                                        }`}>
                                        {step.icon}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${index <= currentStep ? 'text-river-green' : 'text-slate-300'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {pedido.status === 'cancelado' && (
                            <div className="mt-6 bg-score-E/10 p-4 rounded-2xl text-score-E text-sm font-bold text-center border border-score-E/20">
                                Este pedido foi cancelado e não pôde ser concluído.
                            </div>
                        )}
                    </section>

                    {/* 2. DADOS DO RESTAURANTE E ENDEREÇO */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-river-light/30 rounded-2xl text-river-green">
                                <MapPin size={24} weight="fill" />
                            </div>
                            <div>
                                <h4 className="font-black text-river-dark">{pedido.restaurante.nome}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">{pedido.enderecoEntrega}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-river-light/30 rounded-2xl text-river-green">
                                <CreditCard size={24} weight="fill" />
                            </div>
                            <div>
                                <h4 className="font-black text-river-dark">Pagamento</h4>
                                <p className="text-sm text-slate-500">Via {pedido.metodoPagamento}</p>
                            </div>
                        </div>

                        {pedido.comentario && (
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 text-river-green mb-2">
                                    <ChatText size={20} weight="fill" />
                                    <span className="text-xs font-black uppercase tracking-widest">Observações</span>
                                </div>
                                <p className="text-sm text-slate-600 italic">"{pedido.comentario}"</p>
                            </div>
                        )}
                    </div>

                    {/* 3. RESUMO DO PEDIDO (ITENS) */}
                    <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-river-dark">
                            <Receipt size={22} weight="bold" />
                            <h4 className="font-black uppercase text-sm tracking-widest">Itens do Pedido</h4>
                        </div>

                        <div className="space-y-4">
                            {pedido.itens.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex gap-3 items-center">
                                        <span className="bg-slate-50 text-river-green font-black w-7 h-7 rounded-lg flex items-center justify-center text-xs">
                                            {item.quantidade}x
                                        </span>
                                        <span className="text-slate-700 font-medium">{item.nomeProdutoSnapshot}</span>
                                    </div>
                                    <span className="font-bold text-river-dark">
                                        R$ {(item.precoUnitario * item.quantidade).toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                            ))}

                            <div className="border-t border-slate-50 pt-4 mt-4 space-y-2">
                                <div className="flex justify-between text-xs text-slate-400 font-bold uppercase">
                                    <span>Taxa de entrega</span>
                                    <span>R$ {Number(pedido.taxaEntrega).toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black text-river-dark pt-2">
                                    <span>Total</span>
                                    <span className="text-river-green">R$ {Number(pedido.valorTotal).toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. PIN DE SEGURANÇA */}
                    {pedido.status === 'saiu_para_entrega' && (
                        <div className="bg-river-dark p-6 rounded-3xl text-center shadow-xl">
                            <p className="text-river-green text-xs font-black uppercase tracking-[0.2em] mb-2">Código para o Entregador</p>
                            <h5 className="text-4xl font-black text-white tracking-[0.4em]">{pedido.codigoEntrega}</h5>
                            <p className="text-white/40 text-[10px] mt-4 leading-tight">
                                Confirme este código com o entregador <br /> para garantir a segurança da sua entrega.
                            </p>
                        </div>
                    )}
                </div>

                {/* Rodapé do Modal */}
                <footer className="p-6 bg-slate-50 flex flex-col gap-3">

                    {/* O Botão de Cancelar só aparece se estiver PENDENTE */}
                    {pedido.status === 'pendente' && (
                        <button
                            onClick={handleCancelOrder}
                            className="w-full bg-white border-2 border-score-E text-score-E font-black py-4 rounded-2xl hover:bg-score-E hover:text-white transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <X size={20} weight="bold" />
                            Cancelar Pedido
                        </button>
                    )}

                    <button className="w-full bg-white border border-slate-200 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-100 transition-all text-sm uppercase tracking-widest">
                        Preciso de Ajuda
                    </button>
                </footer>
            </div>
        </div>
    );
}