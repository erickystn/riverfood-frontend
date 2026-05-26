// src/pages/MeusPedidos.tsx
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { api } from "../services/api";
import {
  Package,
  Clock,
  CheckCircle,
  Moped,
  WarningCircle,
  Receipt,
  MapPin,
} from "@phosphor-icons/react";
import { toast } from "react-toastify";
import { OrderDetailModal } from '../components/OrderDetailModal';
import type { MetodoPagamento } from "./Checkout";

export interface Pedido {
  id: number;
  data: string;
  metodoPagamento: MetodoPagamento,
  comentario: string,
  taxaEntrega: number,
  status:
    | "pendente"
    | "preparando"
    | "saiu_para_entrega"
    | "entregue"
    | "cancelado";
  valorTotal: number;
  enderecoEntrega: string;
  codigoEntrega: string;
  restaurante: {
    id: number;
    nome: string;
  };
  itens: Array<{
    id: number;
    nomeProdutoSnapshot: string;
    quantidade: number;
  }>;
}

export function MeusPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);

  // 💡 POLLING AGRESSIVO PARA A DEMONSTRAÇÃO
  useEffect(() => {
    async function loadPedidos(isInitialLoad = false) {
      try {
        if (isInitialLoad) setIsLoading(true);
        const response = await api.get("/pedidos");
        setPedidos(response.data);
      } catch (error) {
        // Só exibe o toast de erro no carregamento inicial para não fludar a tela do usuário a cada 3 seg
        if (isInitialLoad) {
          toast.error("Não conseguimos carregar seus pedidos.");
        }
      } finally {
        if (isInitialLoad) setIsLoading(false);
      }
    }

    // 1. Chamada inicial (com loading)
    loadPedidos(true);

    // 2. Loop de atualização silenciosa (sem loading) a cada 3 segundos
    const interval = setInterval(() => {
      loadPedidos(false);
    }, 3000);

    // 3. Limpeza do intervalo quando sair da tela
    return () => clearInterval(interval);
  }, []);

  // Metáfora de Cores para o Status (State Machine visual)
  const statusConfig = {
    pendente: {
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: <Clock size={20} />,
      label: "Aguardando Aprovação",
    },
    preparando: {
      color: "text-river-green",
      bg: "bg-river-light/30",
      icon: <Package size={20} />,
      label: "Na Cozinha",
    },
    saiu_para_entrega: {
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: <Moped size={20} />,
      label: "Em Rota de Entrega",
    },
    entregue: {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: <CheckCircle size={20} />,
      label: "Entregue",
    },
    cancelado: {
      color: "text-score-E",
      bg: "bg-score-E/10",
      icon: <WarningCircle size={20} />,
      label: "Cancelado",
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-10 h-10 border-4 border-river-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-4xl mx-auto animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-river-dark tracking-tight">
          Meus Pedidos
        </h1>
        <p className="text-slate-500 font-medium">
          Acompanhe suas escolhas saudáveis em tempo real.
        </p>
      </header>

      {pedidos.length === 0 ? (
        <div className="bg-surface-card p-20 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Receipt size={40} weight="thin" />
          </div>
          <p className="text-slate-500 font-bold">
            Você ainda não fez nenhum pedido.
          </p>
          <button className="mt-4 text-river-green font-black hover:underline">
            Que tal escolher algo agora?
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {pedidos.map((pedido) => {
            const config = statusConfig[pedido.status];

            return (
              <div
                key={pedido.id}
                className="bg-surface-card rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:border-river-green/30 transition-all"
              >
                {/* TOPO DO CARD: Status e Data */}
                <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${config.bg} ${config.color}`}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <span
                        className={`text-sm font-black uppercase tracking-wider ${config.color}`}
                      >
                        {config.label}
                      </span>
                      <p className="text-xs text-slate-400 font-bold">
                        {new Date(pedido.data).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(pedido.data).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* CÓDIGO DE ENTREGA (Estilo iFood) */}
                  {pedido.status !== "entregue" &&
                    pedido.status !== "cancelado" && (
                      <div className="bg-river-dark text-white px-4 py-2 rounded-xl flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase opacity-60">
                          Código
                        </span>
                        <span className="text-lg font-black tracking-widest text-shadow-amber-50">
                          {pedido.codigoEntrega || "----"}
                        </span>
                      </div>
                    )}
                </div>

                {/* CORPO DO CARD: Detalhes */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Link to={`/restaurante/${pedido.restaurante.id}`} className="inline-block mb-4 group-hover:text-river-green transition-colors">
                      <h3 className="font-black text-slate-800 text-lg hover:underline">
                        {pedido.restaurante.nome}
                      </h3>
                    </Link>
                    <ul className="space-y-2">
                      {pedido.itens.map((item) => (
                        <li
                          key={item.id}
                          className="text-sm text-slate-600 flex justify-between"
                        >
                          <span className="font-medium">
                            {item.quantidade}x {item.nomeProdutoSnapshot}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 justify-end">
                        <MapPin size={14} />
                        <span className="truncate max-w-[200px]">
                          {pedido.enderecoEntrega}
                        </span>
                      </div>
                      <p className="text-2xl font-black text-river-dark">
                        R${" "}
                        {Number(pedido.valorTotal).toFixed(2).replace(".", ",")}
                      </p>
                    </div>

                    <button
                      onClick={() => setPedidoSelecionado(pedido)}
                      className="mt-4 text-xs font-black uppercase text-river-green hover:text-river-dark transition-colors tracking-widest"
                    >
                      Ver Detalhes do Pedido
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Componente do Modal no fim da página */}
      <OrderDetailModal
        isOpen={!!pedidoSelecionado}
        onClose={() => setPedidoSelecionado(null)}
        pedido={pedidoSelecionado}
      />
    </div>
  );
}