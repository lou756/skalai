import { cn } from "@/lib/utils";

interface SEOScoreCardProps {
  score: number;
}

export function SEOScoreCard({ score }: SEOScoreCardProps) {
  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-500";
    return "text-red-600";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Bon";
    if (score >= 40) return "À améliorer";
    return "Critique";
  };

  const getScoreBg = () => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    if (score >= 40) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className={cn("rounded-xl border-2 p-6 text-center", getScoreBg())}>
      <p className="text-sm text-muted-foreground mb-2">Score de visibilité SEO</p>
      <div className={cn("text-6xl font-bold", getScoreColor())}>
        {score}
      </div>
      <p className="text-sm text-muted-foreground mt-1">/100</p>
      <p className={cn("text-lg font-medium mt-2", getScoreColor())}>
        {getScoreLabel()}
      </p>
    </div>
  );
}
