// src/pages/admin/Dashboard.tsx
import { useEffect, useState, useMemo } from 'react';
import { 
  Package, 
  CurrencyDollar, 
  CheckCircle, 
  Warning, 
  TrendUp,
  Receipt,
  XCircle,
  PrinterIcon
} from '@phosphor-icons/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { TagHealthScore } from '../../components/TagHealthScore';
import { gerarRelatorioGerencial } from '../../utils/reportGenerator';

// Componente de Cartão Reutilizável
function StatCard({ title, value, icon: Icon, colorClass, subtitle, badgeText = "Cardápio" }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass.split(' ')[0].replace('bg-', 'bg-').replace('100', '50')} rounded-bl-full -z-10 group-hover:scale-110 transition-transform`}></div>
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${colorClass}`}><Icon size={24} weight="bold" /></div>
        <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg uppercase tracking-widest">{badgeText}</span>
      </div>
      <div>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-3xl font-black text-slate-800">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 font-bold mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}

interface MetricasFinanceiras {
  faturamentoTotal: number;
  ticketMedio: number;
  pedidosEntregues: number;
  pedidosCancelados: number;
  totalPedidosGeral: number;
}

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<MetricasFinanceiras>({
    faturamentoTotal: 0, ticketMedio: 0, pedidosEntregues: 0, pedidosCancelados: 0, totalPedidosGeral: 0
  });
  const [loading, setLoading] = useState(true);

  // BUSCA REAL DOS DADOS (Concorrente)
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Dispara as duas chamadas ao mesmo tempo para ser mais rápido
        const [perfilRes, metricasRes] = await Promise.all([
          api.get('/usuarios/perfil'),
          api.get('/pedidos/metricas/dashboard').catch(() => ({ data: metricas })) // Fallback se a API falhar
        ]);
        
        setProdutos(perfilRes.data.produtos || []);
        if (metricasRes.data.faturamentoTotal !== undefined) {
          setMetricas(metricasRes.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadData();
    }
  }, [user]);

  // CÁLCULOS DINÂMICOS DO CARDÁPIO
  const stats = useMemo(() => {
    if (produtos.length === 0) return null;

    const totalPratos = produtos.length;
    const somaPrecos = produtos.reduce((acc, p) => acc + Number(p.preco), 0);
    const mediaPreco = somaPrecos / totalPratos;
    
    const saudaveis = produtos.filter(p => p.healthScore >= 60).length;
    
    const melhorPrato = produtos.reduce((prev, current) => 
      (prev.healthScore > current.healthScore) ? prev : current
    );

    const criticos = produtos.filter(p => p.healthScore < 60).length;

    return { totalPratos, mediaPreco, saudaveis, melhorPrato, criticos };
  }, [produtos]);

  // Dados para o Gráfico Recharts
  const chartData = [
    { name: 'Entregues', value: metricas.pedidosEntregues, color: '#10b981' }, 
    { name: 'Cancelados', value: metricas.pedidosCancelados, color: '#ef4444' } 
  ];
  const temDadosGrafico = metricas.pedidosEntregues > 0 || metricas.pedidosCancelados > 0;

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-river-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto pb-10">
      
      {/* Importe o ícone Printer do phosphor-icons lá em cima */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Olá, {user?.nome}! 👋</h1>
          <p className="text-slate-500 font-medium mt-1">Veja o desempenho das suas vendas e do seu cardápio hoje.</p>
        </div>
        
       <button 
          onClick={() => gerarRelatorioGerencial({ user, metricas, stats: stats! })}
          disabled={!stats} // Evita gerar antes de carregar
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-river-dark transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <PrinterIcon size={20} weight="bold" />
          Exportar Relatório
        </button>
      </header>

      {/* 💡 BLOCO 1: KPI FINANCEIROS */}
      <div>
        <h2 className="text-lg font-black text-slate-700 mb-4 flex items-center gap-2">
          <CurrencyDollar size={24} className="text-emerald-500" /> Resultados de Vendas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Faturamento" 
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.faturamentoTotal)} 
            icon={TrendUp} colorClass="bg-emerald-100 text-emerald-600" badgeText="Financeiro" 
          />
          <StatCard 
            title="Ticket Médio" 
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metricas.ticketMedio)} 
            icon={Receipt} colorClass="bg-blue-100 text-blue-600" badgeText="Financeiro" 
          />
          <StatCard 
            title="Entregas" 
            value={metricas.pedidosEntregues} 
            icon={Package} colorClass="bg-slate-100 text-slate-600" badgeText="Operação" 
          />
          <StatCard 
            title="Cancelamentos" 
            value={metricas.pedidosCancelados} 
            icon={XCircle} colorClass="bg-red-100 text-red-500" badgeText="Operação" 
          />
        </div>
      </div>

      {/* 💡 BLOCO 2: KPI DE PRODUTOS E CARDÁPIO */}
      {stats && (
        <div>
          <h2 className="text-lg font-black text-slate-700 mb-4 flex items-center gap-2 mt-4">
            <CheckCircle size={24} className="text-river-green" /> Inteligência de Cardápio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total de Itens" value={stats.totalPratos} icon={Package} colorClass="bg-indigo-100 text-indigo-600" />
            <StatCard title="Preço Médio" value={`R$ ${stats.mediaPreco.toFixed(2).replace('.', ',')}`} icon={CurrencyDollar} colorClass="bg-teal-100 text-teal-600" />
            <StatCard title="Pratos Saudáveis" value={stats.saudaveis} icon={CheckCircle} colorClass="bg-river-light text-river-dark" />
            <StatCard title="Pratos Críticos" value={stats.criticos} icon={Warning} colorClass="bg-amber-100 text-amber-600" />
          </div>
        </div>
      )}

      {/* 💡 BLOCO 3: GRÁFICOS E INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico Recharts de Operação */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 w-full text-left">Proporção Operacional</h3>
          <div className="h-48 w-full">
            {temDadosGrafico ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: '900' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 text-center">
                Nenhuma venda<br/>registrada hoje.
              </div>
            )}
          </div>
        </div>

        {/* Destaque Dinâmico do HealthScore */}
        {stats && (
          <div className="lg:col-span-2 bg-river-dark rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-between">
            <div className="relative z-10">
              <span className="bg-river-green text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-river-dark">
                Seu Melhor HealthScore
              </span>
              <h2 className="text-3xl font-black mt-4 mb-2">{stats.melhorPrato.nome}</h2>
              <div className="mt-8 flex items-center gap-4">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-river-light mb-3">Score Calculado</p>
                  <TagHealthScore score={stats.melhorPrato.healthScore} showLabel={true} />
                </div>
              </div>
            </div>
            <TrendUp size={200} weight="thin" className="absolute -right-10 -bottom-10 text-white/5 rotate-12 pointer-events-none" />
          </div>
        )}

      </div>
    </div>
  );
}