// src/components/HealthScoreSection.tsx
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Plus, 
  Minus, 
  ArrowsCounterClockwise,
  Calculator,
  ArrowRight,
  Equals
} from '@phosphor-icons/react';
import { getHealthScoreDetails } from '../utils/healthScore';

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
    let score = 70; // Base de cálculo inicial
    
    activeTags.forEach(tagId => {
      const config = tagsConfig.find(t => t.id === tagId);
      if (config) score += config.points;
    });
    
    // Trava a nota final para nunca passar de 100 nem ficar negativa
    const finalScore = Math.min(Math.max(score, 0), 100);
    return getHealthScoreDetails(finalScore);
    
  }, [activeTags]);

  const toggleTag = (id: string) => {
    setActiveTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  return (
    <section id="entenda" className="py-24 px-6 bg-slate-50/50">
      <div className="max-w-6xl mx-auto">
        
        {/* === PARTE 1: A EXPLICAÇÃO DIDÁTICA (Abertura da Caixa Preta) === */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-river-green font-black text-xs uppercase tracking-[0.3em]">Transparência Nutricional</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800">
            A Matemática do <span className="text-river-green">RiverScore</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Nada de "achismos" ou letras aleatórias. Nosso sistema analisa o DNA do prato através de uma equação simples e rigorosa. Veja como calculamos a sua saúde:
          </p>
        </div>

        {/* O FLUXO DA EQUAÇÃO */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-lg border border-slate-100 mb-20 relative">
          
          {/* Conectores Visuais (Escondidos no mobile) */}
          <div className="hidden lg:block absolute top-[50%] left-0 w-full h-1 bg-slate-50 -z-0"></div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
            
            {/* Passo 1: Base */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 text-center flex flex-col items-center relative shadow-sm hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-slate-800 text-white rounded-2xl flex items-center justify-center font-black text-xl mb-4 shadow-lg shadow-slate-800/20">
                70
              </div>
              <h3 className="font-black text-slate-800 mb-2">Nota Base</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Todo prato cadastrado no sistema começa com 70 pontos neutros (Nota B).
              </p>
              <div className="absolute -right-6 top-[40%] hidden lg:flex items-center justify-center bg-white w-8 h-8 rounded-full border border-slate-200 text-slate-300">
                <Plus size={16} weight="bold" />
              </div>
            </div>

            {/* Passo 2: Bônus */}
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 text-center flex flex-col items-center relative shadow-sm hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-2xl mb-4">
                <Plus weight="bold" />
              </div>
              <h3 className="font-black text-emerald-700 mb-2">Bônus Nutricional</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Adicionamos de <strong className="text-emerald-600">+10 a +15 pontos</strong> se o prato for orgânico, rico em fibras ou cozido no vapor.
              </p>
              <div className="absolute -right-6 top-[40%] hidden lg:flex items-center justify-center bg-white w-8 h-8 rounded-full border border-slate-200 text-slate-300">
                <Minus size={16} weight="bold" />
              </div>
            </div>

            {/* Passo 3: Pênaltis */}
            <div className="bg-white rounded-3xl p-6 border-2 border-red-100 text-center flex flex-col items-center relative shadow-sm hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black text-2xl mb-4">
                <Minus weight="bold" />
              </div>
              <h3 className="font-black text-red-700 mb-2">Pênaltis Críticos</h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Subtraímos de <strong className="text-red-600">-20 a -50 pontos</strong> se houver fritura em imersão, ultraprocessados ou excesso de sódio.
              </p>
              <div className="absolute -right-6 top-[40%] hidden lg:flex items-center justify-center bg-white w-8 h-8 rounded-full border border-slate-200 text-slate-300">
                <Equals size={16} weight="bold" />
              </div>
            </div>

            {/* Passo 4: Resultado */}
            <div className="bg-slate-900 rounded-3xl p-6 border-2 border-slate-800 text-center flex flex-col items-center relative shadow-xl hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 bg-river-green text-river-dark rounded-2xl flex items-center justify-center font-black text-xl mb-4">
                A-E
              </div>
              <h3 className="font-black text-white mb-2">O Veredito</h3>
              <p className="text-xs font-medium text-slate-300 leading-relaxed">
                A soma final define a letra. Acima de 90 é <strong className="text-river-green">A</strong>. Abaixo de 40 vira <strong className="text-score-E">E</strong>. Transparente e direto.
              </p>
            </div>

          </div>
        </div>

        {/* === PARTE 2: O SIMULADOR INTERATIVO (O Laboratório) === */}
        <div className="pt-12 border-t border-slate-200">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
             <div className="bg-river-dark p-4 rounded-3xl text-river-green shadow-lg shadow-river-dark/20">
                <Calculator size={32} weight="duotone" />
             </div>
             <div className="text-center md:text-left">
                <h3 className="text-3xl font-black text-slate-800">Laboratório Interativo</h3>
                <p className="text-slate-500 font-medium text-lg mt-1">Ligue e desligue os ingredientes abaixo e veja o algoritmo recalcular a nota ao vivo.</p>
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
                      ? (tag.type === 'pos' ? 'border-river-green bg-river-green/5' : 'border-score-E bg-score-E/5') 
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm hover:shadow-md'}
                  `}
                >
                  <div className="flex flex-col items-start">
                    <span className={`font-black text-sm ${activeTags.includes(tag.id) ? 'text-slate-800' : 'text-slate-500'}`}>
                      {tag.label}
                    </span>
                    {/* 💡 Novo: Mostra exatamente o peso daquela tag no botão */}
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${tag.type === 'pos' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tag.points > 0 ? `+${tag.points} pts` : `${tag.points} pts`}
                    </span>
                  </div>
                  
                  <div className={`p-2 rounded-xl transition-colors ${activeTags.includes(tag.id) ? (tag.type === 'pos' ? 'bg-river-green text-white' : 'bg-score-E text-white') : 'bg-slate-100 text-slate-400'}`}>
                    {tag.type === 'pos' ? <Plus size={20} weight="bold" /> : <Minus size={20} weight="bold" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Display da Nota Neon-Dark */}
            <div className="lg:col-span-5 bg-slate-900 rounded-[3.5rem] p-10 flex flex-col items-center justify-center relative overflow-hidden text-center shadow-2xl min-h-[400px] border border-slate-800">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scoreResult.letter}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative z-10 flex flex-col items-center gap-6"
                >
                  {/* O quadrado principal com a Letra */}
                  <div className={`w-32 h-32 rounded-[2.5rem] ${scoreResult.color} ${scoreResult.textColor} flex items-center justify-center text-7xl font-black shadow-2xl shadow-black/50 transition-all duration-500`}>
                    {scoreResult.letter}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-2xl font-black uppercase tracking-widest text-white">
                      {scoreResult.label}
                    </h4>
                    <p className="text-slate-400 text-sm px-6 leading-relaxed font-medium">
                      {scoreResult.description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Detalhes Tech de Fundo */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-[1px] border-river-light rounded-full border-dashed animate-[spin_30s_linear_infinite]" />
              </div>
            </div>
          </div>
        </div>

        {/* Selo de Garantia */}
        <div className="mt-16 flex justify-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-white border border-slate-200 shadow-sm">
            <ShieldCheck size={24} weight="fill" className="text-river-green" />
            <span className="text-sm font-bold text-slate-700">Lógica baseada em diretrizes de nutrição funcional e transparência do consumidor.</span>
          </div>
        </div>

      </div>
    </section>
  );
}