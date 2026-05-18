// src/components/TagHealthScore.tsx
import { cn } from "../utils/cn";
import { getHealthScoreDetails } from "../utils/healthScore";

interface TagHealthScoreProps {
  score: number; // Agora recebemos a nota numérica bruta do NestJS (0 a 100)
  className?: string; 
  showLabel?: boolean; // Opção de mostrar "A - Excelente" ou só "A"
}

export function TagHealthScore({ score, className, showLabel = false }: TagHealthScoreProps) {
  // O Utilitário faz todo o trabalho sujo de decidir se é A, B, C, D ou E
  const details = getHealthScoreDetails(score);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-black rounded-lg border-2 shadow-sm transition-transform hover:scale-105 cursor-help",
        showLabel ? "px-3 py-1 gap-2 text-xs" : "w-8 h-8 text-sm", // Expande se tiver label
        details.color,       // A cor de fundo mapeada ('bg-emerald-500', etc)
        details.textColor,   // A cor do texto
        `border-${details.color.replace('bg-', '')}`, // Dica de Tailwind para borda igual ao fundo
        className
      )}
      title={`${details.label}: ${details.description}`}
    >
      <span>{details.letter}</span>
      {showLabel && <span className="uppercase tracking-widest">- {details.label}</span>}
    </div>
  );
}