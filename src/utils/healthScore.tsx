// src/utils/healthScore.ts

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'E';

interface HealthScoreInfo {
  letter: HealthGrade;
  color: string;      // Classe Tailwind para o fundo
  textColor: string;  // Classe Tailwind para o texto
  label: string;      // Texto explicativo curto
  description: string; // Explicação detalhada (bom para tooltips)
}

export function getHealthScoreDetails(score: number): HealthScoreInfo {
  if (score >= 85) {
    return { letter: 'A', color: 'bg-emerald-500', textColor: 'text-white', label: 'Excelente', description: 'Rico em fibras, proteínas e in-natura. Consumo livre.' };
  }
  if (score >= 70) {
    return { letter: 'B', color: 'bg-lime-500', textColor: 'text-white', label: 'Bom', description: 'Alimento equilibrado, minimamente processado.' };
  }
  if (score >= 50) {
    return { letter: 'C', color: 'bg-amber-400', textColor: 'text-slate-800', label: 'Moderado', description: 'Atenção aos níveis de sódio ou calorias. Consumo moderado.' };
  }
  if (score >= 30) {
    return { letter: 'D', color: 'bg-orange-500', textColor: 'text-white', label: 'Atenção', description: 'Processado ou com excesso de gorduras/açúcar.' };
  }
  // score < 30
  return { letter: 'E', color: 'bg-score-E', textColor: 'text-white', label: 'Evite', description: 'Ultraprocessado. O famoso "Dia do Lixo".' };
}