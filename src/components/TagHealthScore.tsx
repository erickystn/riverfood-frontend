// src/components/TagHealthScore.tsx
import { cn } from "../utils/cn";

// Tipamos exatamente o que esperamos do backend NestJS
export type HealthScoreType = 'A' | 'B' | 'C' | 'D' | 'E';

interface TagHealthScoreProps {
  score: HealthScoreType;
  className?: string; // Permite passar margens extras quando formos usar no card
}

export function TagHealthScore({ score, className }: TagHealthScoreProps) {
  // Dicionário de estilos: Mapeia cada nota para suas cores específicas
  const scoreStyles = {
    A: "bg-score-A text-white border-score-A",
    B: "bg-score-B text-white border-score-B",
    C: "bg-score-C text-white border-score-C",
    D: "bg-score-D text-white border-score-D",
    E: "bg-score-E text-white border-score-E",
  };

  return (
    <div
      className={cn(
        // Classes base (tamanho, formato, fonte)
        "flex items-center justify-center font-black rounded-md border-2",
        "w-8 h-8 text-sm", // Tamanho padrão, pode ser ajustado
        scoreStyles[score], // Cor dinâmica baseada na prop
        className // Classes extras passadas pelo pai
      )}
      title={`Classificação Nutricional: ${score}`}
    >
      {score}
    </div>
  );
}