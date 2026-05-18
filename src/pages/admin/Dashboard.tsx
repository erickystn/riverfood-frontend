// src/pages/admin/Dashboard.tsx
import { useEffect, useState, useMemo } from 'react';
import { ChartPieSlice, Package, CurrencyDollar, CheckCircle, Warning, TrendUp } from '@phosphor-icons/react';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { TagHealthScore } from '../../components/TagHealthScore';

// Componente do Cartão (Mantido igual)
function StatCard({ title, value, icon: Icon, colorClass, subtitle }: any) {
  return (
    <div className="bg-surface-card p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${colorClass}`}><Icon size={24} weight="bold" /></div>
        <span className="text-xs font-bold text-surface-muted bg-slate-50 px-2 py-1 rounded-lg">Cardápio</span>
      </div>
      <div>
        <p className="text-sm font-medium text-surface-muted">{title}</p>
        <h3 className="text-3xl font-black text-surface-text mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-river-dark font-bold mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // BUSCA REAL DOS DADOS
  useEffect(() => {
    async function loadData() {
      try {
        // 💡 Ajustado para buscar do perfil autenticado (seguro)
        const response = await api.get('/usuarios/perfil');
        setProdutos(response.data.produtos || []);
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

  // CÁLCULOS DINÂMICOS
  const stats = useMemo(() => {
    if (produtos.length === 0) return null;

    const totalPratos = produtos.length;
    const somaPrecos = produtos.reduce((acc, p) => acc + Number(p.preco), 0);
    const mediaPreco = somaPrecos / totalPratos;
    
    // Pratos com nota >= 60 são considerados saudáveis (A e B no nosso sistema)
    const saudaveis = produtos.filter(p => p.healthScore >= 60).length;
    
    // Descobre o melhor prato
    const melhorPrato = produtos.reduce((prev, current) => 
      (prev.healthScore > current.healthScore) ? prev : current
    );

    // Conta pratos críticos (Nota C ou pior, ou seja, < 60)
    const criticos = produtos.filter(p => p.healthScore < 60).length;

    return { totalPratos, mediaPreco, saudaveis, melhorPrato, criticos };
  }, [produtos]);

  if (loading) return <div className="p-10 text-center animate-pulse text-surface-muted font-bold">Carregando métricas da cozinha...</div>;

  return (
    <div className="space-y-10 animate-fade-in">
      <header>
        <h1 className="text-3xl font-black tracking-tight">Olá, {user?.nome}! 👋</h1>
        <p className="text-surface-muted">Veja o desempenho real do seu cardápio hoje.</p>
      </header>

      {stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total de Itens" value={stats.totalPratos} icon={Package} colorClass="bg-blue-100 text-blue-600" />
            <StatCard title="Preço Médio" value={`R$ ${stats.mediaPreco.toFixed(2).replace('.', ',')}`} icon={CurrencyDollar} colorClass="bg-river-light text-river-dark" />
            <StatCard title="Pratos Saudáveis" value={stats.saudaveis} icon={CheckCircle} colorClass="bg-emerald-100 text-emerald-600" />
            <StatCard title="Pratos Críticos" value={stats.criticos} icon={Warning} colorClass="bg-amber-100 text-amber-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Destaque Dinâmico baseado no melhor score */}
            <div className="lg:col-span-2 bg-river-dark rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <span className="bg-river-green text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Maior HealthScore
                </span>
                <h2 className="text-3xl font-black mt-4 mb-2">{stats.melhorPrato.nome}</h2>
                <div className="mt-8 flex items-center gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-river-light mb-3">Score Calculado</p>
                    
                    {/* 💡 Ajuste de Ouro: Agora a Tag se resolve sozinha com o score do banco */}
                    <TagHealthScore score={stats.melhorPrato.healthScore} showLabel={true} />
                  
                  </div>
                </div>
              </div>
              <TrendUp size={200} weight="thin" className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
            </div>
            
            {/* Alerta Inteligente */}
            {stats.criticos > 0 && (
              <div className="bg-surface-card rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
                 <div className="text-score-E bg-score-E/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                  <Warning size={28} weight="fill" />
                </div>
                <h3 className="text-xl font-bold mb-2">Atenção ao Cardápio</h3>
                <p className="text-sm text-surface-muted">Você tem <strong>{stats.criticos} prato(s)</strong> com score baixo. Substitua ingredientes para melhorar a avaliação!</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-10 bg-surface-card rounded-3xl text-center text-surface-muted border border-slate-100">
          Cadastre seu primeiro prato para ver as estatísticas.
        </div>
      )}
    </div>
  );
}