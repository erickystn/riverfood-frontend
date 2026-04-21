import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heartbeat, Leaf, ThermometerHot, ShieldCheck, 
  Plus, Minus, ArrowsCounterClockwise, CheckCircle 
} from '@phosphor-icons/react';

export function HealthScoreSection() {
  // --- Lógica do Simulador ---
  const [activeTags, setActiveTags] = useState<string[]>(['VAPOR', 'ORGANICO']);

  const tagsConfig = [
    { id: 'ORGANICO', label: 'Ingrediente Orgânico', points: 15, type: 'pos' },
    { id: 'VAPOR', label: 'Cozido no Vapor', points: 15, type: 'pos' },
    { id: 'INTEGRAL', label: 'Grãos Integrais', points: 10, type: 'pos' },
    { id: 'FRITO', label: 'Fritura em Imersão', points: -50, type: 'neg' },
    { id: 'PROCESSADO', label: 'Açúcar Refinado', points: -30, type: 'neg' },
    { id: 'SODIO', label: 'Sódio em Excesso', points: -20, type: 'neg' },
  ];

  const scoreResult = useMemo(() => {
    let score = 70;
    activeTags.forEach(tagId => {
      const config = tagsConfig.find(t => t.id === tagId);
      if (config) score += config.points;
    });
    const finalScore = Math.min(Math.max(score, 0), 100);
    
    if (finalScore >= 80) return { letter: 'A', color: 'bg-river-green', text: 'Saúde Máxima', shadow: 'shadow-river-green/30' };
    if (finalScore >= 50) return { letter: 'B', color: 'bg-orange-400', text: 'Equilibrado', shadow: 'shadow-orange-400/30' };
    return { letter: 'C', color: 'bg-rose-500', text: 'Evitar', shadow: 'shadow-rose-500/40' };
  }, [activeTags]);

  const toggleTag = (id: string) => {
    setActiveTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  return (
    <section className="py-24 px-6 bg-slate-50/50">
      <div className="max-w-6xl mx-auto">
        
        {/* === PARTE 1: A EXPLICAÇÃO LÚDICA === */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-river-green font-black text-xs uppercase tracking-[0.3em]">Tecnologia Nutricional</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800">
            Como funciona o <span className="text-river-green">HealthScore?</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Nossa inteligência analisa o DNA do prato para garantir que você saiba 
            exatamente o que está colocando no corpo.
          </p>
        </div>

        {/* Pilares */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { title: "Origem", desc: "Ingredientes in-natura e sem conservantes.", icon: <Leaf size={32} weight="duotone" className="text-river-green" />, bg: "bg-emerald-50" },
            { title: "Preparo", desc: "Técnicas que preservam nutrientes e sabor.", icon: <ThermometerHot size={32} weight="duotone" className="text-orange-500" />, bg: "bg-orange-50" },
            { title: "Equilíbrio", desc: "Dose certa de fibras e baixo sódio.", icon: <Heartbeat size={32} weight="duotone" className="text-cyan-500" />, bg: "bg-cyan-50" }
          ].map((pilar, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] border-2 border-transparent ${pilar.bg} hover:border-white hover:shadow-xl transition-all duration-300`}>
              <div className="mb-4">{pilar.icon}</div>
              <h3 className="text-xl font-black text-slate-800 mb-2">{pilar.title}</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">{pilar.desc}</p>
            </div>
          ))}
        </div>

        {/* Barras de Impacto (Visual de "Vida") */}
        <div className="bg-white rounded-[3.5rem] p-8 md:p-12 shadow-sm border border-slate-100 mb-20">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10 text-center">Peso das Escolhas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="font-black text-slate-800">Orgânicos + Cozimento Leve</span>
                <span className="text-river-green font-black">+25 pts</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: '85%' }} className="h-full bg-river-green" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="font-black text-slate-800">Processados + Frituras</span>
                <span className="text-rose-500 font-black">-50 pts</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: '100%' }} whileInView={{ width: '20%' }} className="h-full bg-rose-500" />
              </div>
            </div>
          </div>
        </div>

        {/* === PARTE 2: O SIMULADOR INTERATIVO === */}
        <div className="pt-12 border-t border-slate-200">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
             <div className="bg-river-dark p-3 rounded-2xl text-white">
                <ArrowsCounterClockwise size={28} weight="bold" />
             </div>
             <div className="text-center md:text-left">
                <h3 className="text-2xl font-black text-slate-800">Laboratório Interativo</h3>
                <p className="text-slate-500 font-medium">Faça o teste: combine os elementos e veja a nota mudar.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Tags de Controle */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tagsConfig.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`
                    group flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300
                    ${activeTags.includes(tag.id) 
                      ? (tag.type === 'pos' ? 'border-river-green bg-river-green/5' : 'border-rose-500 bg-rose-500/5') 
                      : 'border-slate-200 bg-white hover:border-slate-300'}
                  `}
                >
                  <span className={`font-bold text-sm ${activeTags.includes(tag.id) ? 'text-slate-800' : 'text-slate-500'}`}>
                    {tag.label}
                  </span>
                  <div className={`p-1.5 rounded-lg transition-colors ${activeTags.includes(tag.id) ? (tag.type === 'pos' ? 'bg-river-green text-white' : 'bg-rose-500 text-white') : 'bg-slate-100 text-slate-400'}`}>
                    {tag.type === 'pos' ? <Plus size={16} weight="bold" /> : <Minus size={16} weight="bold" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Display da Nota Neon-Dark */}
            <div className="lg:col-span-5 bg-slate-800 rounded-[3.5rem] p-10 flex flex-col items-center justify-center relative overflow-hidden text-center shadow-2xl min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scoreResult.letter}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative z-10 flex flex-col items-center gap-6"
                >
                  <div className={`w-32 h-32 rounded-[2.5rem] ${scoreResult.color} ${scoreResult.shadow} flex items-center justify-center text-6xl font-black text-white shadow-2xl transition-all duration-500`}>
                    {scoreResult.letter}
                  </div>
                  
                  <div className="space-y-1">
                    <span className={`text-sm font-black uppercase tracking-widest ${scoreResult.letter === 'A' ? 'text-river-green' : scoreResult.letter === 'B' ? 'text-orange-400' : 'text-rose-500'}`}>
                      {scoreResult.text}
                    </span>
                    <p className="text-slate-400 text-xs px-8 leading-relaxed">
                      {scoreResult.letter === 'A' && "Este prato é um combustível premium para o seu corpo."}
                      {scoreResult.letter === 'B' && "Uma escolha equilibrada. Bom para variar o cardápio."}
                      {scoreResult.letter === 'C' && "Tente substituir por opções menos processadas."}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Detalhes Tech de Fundo */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-[1px] border-white rounded-full border-dashed animate-[spin_20s_linear_infinite]" />
              </div>
            </div>
          </div>
        </div>

        {/* Selo de Garantia */}
        <div className="mt-16 flex justify-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-slate-200 shadow-sm">
            <ShieldCheck size={24} weight="fill" className="text-river-green" />
            <span className="text-sm font-bold text-slate-700">Algoritmo validado por especialistas em nutrição funcional</span>
          </div>
        </div>

      </div>
    </section>
  );
}